<?php
// TshedzaWebDev API: the only server-side code for the public site.
//   POST /quote/send : verify the estimate, store the lead, email PDF to client + alert to owner
//   POST /contact    : store the message, email the owner
//   /wall...         : community wall (lib/wall.php)
declare(strict_types=1);

require dirname(__DIR__) . '/lib/bootstrap.php';
require dirname(__DIR__) . '/lib/engine.php';
require dirname(__DIR__) . '/lib/store.php';
require dirname(__DIR__) . '/lib/mail.php';
require dirname(__DIR__) . '/lib/pdf.php';
require dirname(__DIR__) . '/lib/wall.php';

const CONSENT_VERSIONS = ['2026-10-29'];

header('X-Content-Type-Options: nosniff');
$path = rtrim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/', '/');
$method = $_SERVER['REQUEST_METHOD'] ?? '';

try {
    // Opened from the owner's email, not from the site, so it sits before the CORS check.
    if (str_ends_with($path, '/wall/moderate')) handle_wall_moderate();

    cors();
    if ($method === 'GET' && str_ends_with($path, '/wall')) handle_wall_list();
    if ($method !== 'POST') json_out(405, ['error' => 'Method not allowed']);

    // Housekeeping: retention (24 months), old rate events and unpublished wall notes (30 days), on ~2% of requests.
    if (random_int(1, 50) === 1) {
        db()->prepare('DELETE FROM leads WHERE created_at < ?')->execute([gmdate('Y-m-d H:i:s', strtotime('-24 months'))]);
        db()->prepare('DELETE FROM rate_events WHERE created_at < ?')->execute([gmdate('Y-m-d H:i:s', time() - 86400 * 2)]);
        db()->prepare("DELETE FROM wall_notes WHERE status <> 'approved' AND created_at < ?")->execute([gmdate('Y-m-d H:i:s', strtotime('-30 days'))]);
    }

    if (str_ends_with($path, '/quote/send')) handle_quote();
    if (str_ends_with($path, '/contact')) handle_contact();
    if (str_ends_with($path, '/wall/heart')) handle_wall_heart();
    if (str_ends_with($path, '/wall')) handle_wall_post();
    json_out(404, ['error' => 'Not found']);
} catch (Throwable $e) {
    error_log('[api] ' . get_class($e) . ': ' . $e->getMessage());   // no PII in messages
    json_out(500, ['error' => 'Something went wrong. Please try WhatsApp instead.']);
}

function validate_contact(array $c, bool $needsMessage): array
{
    $out = [
        'name' => one_line(clean_text($c['name'] ?? '', 120)),
        'email' => one_line(clean_text($c['email'] ?? '', 190)),
        'phone' => one_line(clean_text($c['phone'] ?? '', 40)),
        'business' => one_line(clean_text($c['business'] ?? '', 160)),
        'notes' => clean_text($c['notes'] ?? ($c['message'] ?? ''), 3000),
    ];
    if (mb_strlen($out['name']) < 2) json_out(422, ['error' => 'Please enter your name.']);
    if (!filter_var($out['email'], FILTER_VALIDATE_EMAIL)) json_out(422, ['error' => 'Please enter a valid email address.']);
    if ($out['phone'] !== '' && !preg_match('/^[+\d][\d\s()-]{8,}$/', $out['phone'])) json_out(422, ['error' => 'Please check the phone number.']);
    if ($needsMessage && mb_strlen($out['notes']) < 10) json_out(422, ['error' => 'Please tell us a little more.']);
    return $out;
}

function handle_quote(): never
{
    $in = read_json_body();
    if (($in['website'] ?? '') !== '') json_out(200, ['ref' => 'EST-0']);            // honeypot: pretend success
    if (($in['consent'] ?? false) !== true || !in_array($in['consentVersion'] ?? '', CONSENT_VERSIONS, true)) json_out(422, ['error' => 'Consent is required.']);
    if (rate_limited('quote', 5, 3600)) json_out(429, ['error' => 'Too many requests. Please try again later or WhatsApp us.']);

    $contact = validate_contact((array) ($in['contact'] ?? []), false);
    $book = json_decode((string) file_get_contents(dirname(__DIR__) . '/data/pricebook.json'), true);

    $s = (array) ($in['selection'] ?? []);
    $sel = [
        'service' => (string) ($s['service'] ?? ''),
        'tier' => (string) ($s['tier'] ?? ''),
        'units' => is_numeric($s['units'] ?? null) ? (float) $s['units'] : 1,
        'addons' => array_filter((array) ($s['addons'] ?? []), fn($v, $k) => is_string($k) && is_numeric($v), ARRAY_FILTER_USE_BOTH),
        'monthly' => array_values(array_filter((array) ($s['monthly'] ?? []), 'is_string')),
        'priority' => ($s['priority'] ?? false) === true,
    ];
    try { $est = twd_compute_estimate($sel, $book); } catch (QuoteError) { json_out(422, ['error' => 'Unknown selection.']); }

    // The browser's numbers must match the server's own calculation exactly.
    $claimed = (array) ($in['estimate'] ?? []);
    foreach (['oneOff', 'monthly', 'low', 'high'] as $k) {
        if ((int) ($claimed[$k] ?? -1) !== $est[$k]) json_out(409, ['error' => 'Prices have been updated. Please refresh the page and try again.']);
    }

    $service = current(array_filter($book['services'], fn($x) => $x['id'] === $sel['service']));
    $tier = current(array_filter($service['tiers'], fn($x) => $x['id'] === $sel['tier']));
    $ref = next_ref();
    $now = gmdate('Y-m-d H:i:s');

    $ins = db()->prepare('INSERT INTO leads (ref, kind, created_at, name, email, phone, business, message, service_id, selection_json, one_off, monthly, low, high, deposit, weeks, pricebook_version, consent_at, consent_version, ip_hash)
        VALUES (?, \'estimate\', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $ins->execute([$ref, $now, $contact['name'], $contact['email'], $contact['phone'] ?: null, $contact['business'] ?: null, $contact['notes'] ?: null,
        $sel['service'], json_encode($sel), $est['oneOff'], $est['monthly'], $est['low'], $est['high'], $est['deposit'], $est['weeks'], $est['pricebookVersion'],
        $now, (string) $in['consentVersion'], ip_hash()]);

    $pdfData = build_estimate_pdf($ref, $contact, $service, $tier, $est, $book);
    $range = $est['oneOff'] > 0 ? twd_rand($est['low']) . ' – ' . twd_rand($est['high']) : '';
    $monthly = $est['monthly'] > 0 ? twd_rand($est['monthly']) . '/month' : '';
    $headline = trim($range . ($range && $monthly ? ' + ' : '') . $monthly);

    $clientHtml = email_layout('Your estimate ' . $ref, '<p style="margin:0 0 12px;line-height:1.6">Hi ' . h($contact['name']) . ',</p>'
        . '<p style="margin:0 0 12px;line-height:1.6">Thank you for using our instant quote. Your estimate for <strong>' . h($service['name'] . ': ' . $tier['name']) . '</strong> is <strong>' . h($headline) . '</strong>, with an estimated timeline of about ' . $est['weeks'] . ' week' . ($est['weeks'] === 1 ? '' : 's') . '.</p>'
        . '<p style="margin:0 0 12px;line-height:1.6">The full breakdown is attached as a PDF. We will be in touch to talk it through. Or reply to this email or WhatsApp us on 069 951 3836 any time.</p>'
        . '<p style="margin:0;line-height:1.6">Grateful for the chance to help,<br>Tshedza · TshedzaWebDev</p>');
    $clientText = "Hi {$contact['name']},\n\nYour estimate {$ref} for {$service['name']}: {$tier['name']} is {$headline}, about {$est['weeks']} weeks.\nThe full breakdown is attached.\n\nGrateful for the chance to help,\nTshedza · TshedzaWebDev\nWhatsApp 069 951 3836";
    $sentClient = send_mail($contact['email'], "Your TshedzaWebDev estimate $ref", $clientHtml, $clientText, (string) cfg('owner_email'),
        ['name' => "TshedzaWebDev-estimate-$ref.pdf", 'data' => $pdfData, 'type' => 'application/pdf']);

    $ownerHtml = email_layout("New estimate $ref", '<p style="line-height:1.6;margin:0 0 12px"><strong>' . h($contact['name']) . '</strong>' . ($contact['business'] ? ' · ' . h($contact['business']) : '') . '<br>'
        . h($contact['email']) . ($contact['phone'] ? ' · ' . h($contact['phone']) : '') . '</p>'
        . '<p style="line-height:1.6;margin:0 0 12px">' . h($service['name'] . ': ' . $tier['name']) . '<br><strong>' . h($headline) . '</strong> · deposit ' . h(twd_rand($est['deposit'])) . ' · ' . $est['weeks'] . ' wk</p>'
        . ($contact['notes'] ? '<p style="line-height:1.6;margin:0 0 12px;white-space:pre-wrap">' . h($contact['notes']) . '</p>' : '')
        . '<p style="color:#5f6b7a;font-size:12px;margin:0">Consent recorded ' . h($now) . ' UTC (v' . h((string) $in['consentVersion']) . '). PDF attached.</p>');
    $sentOwner = send_mail((string) cfg('owner_email'), "New estimate $ref: {$contact['name']} ({$service['name']})", $ownerHtml, strip_tags(str_replace('<br>', "\n", $ownerHtml)), $contact['email'],
        ['name' => "TshedzaWebDev-estimate-$ref.pdf", 'data' => $pdfData, 'type' => 'application/pdf']);

    db()->prepare('UPDATE leads SET email_client_sent = ?, email_owner_sent = ? WHERE ref = ?')->execute([(int) $sentClient, (int) $sentOwner, $ref]);
    if (!$sentClient) error_log("[api] client email failed for $ref");
    json_out(200, ['ref' => $ref, 'emailed' => $sentClient]);
}

function handle_contact(): never
{
    $in = read_json_body();
    if (($in['website'] ?? '') !== '') json_out(200, ['ok' => true]);                // honeypot
    if (($in['consent'] ?? false) !== true) json_out(422, ['error' => 'Consent is required.']);
    if (rate_limited('contact', 10, 86400)) json_out(429, ['error' => 'Too many messages today. Please WhatsApp us instead.']);
    $c = validate_contact($in, true);
    $now = gmdate('Y-m-d H:i:s');
    $ref = 'MSG-' . gmdate('YmdHis') . '-' . bin2hex(random_bytes(2));
    db()->prepare("INSERT INTO leads (ref, kind, created_at, name, email, phone, message, consent_at, consent_version, ip_hash) VALUES (?, 'contact', ?, ?, ?, ?, ?, ?, ?, ?)")
        ->execute([$ref, $now, $c['name'], $c['email'], $c['phone'] ?: null, $c['notes'], $now, CONSENT_VERSIONS[0], ip_hash()]);
    $html = email_layout('New website message', '<p style="line-height:1.6;margin:0 0 12px"><strong>' . h($c['name']) . '</strong><br>' . h($c['email']) . ($c['phone'] ? ' · ' . h($c['phone']) : '') . '</p>'
        . '<p style="line-height:1.6;margin:0;white-space:pre-wrap">' . h($c['notes']) . '</p>');
    $sent = send_mail((string) cfg('owner_email'), 'Website message from ' . $c['name'], $html, "{$c['name']} <{$c['email']}> {$c['phone']}\n\n{$c['notes']}", $c['email']);
    db()->prepare('UPDATE leads SET email_owner_sent = ? WHERE ref = ?')->execute([(int) $sent, $ref]);
    json_out(200, ['ok' => true]);
}
