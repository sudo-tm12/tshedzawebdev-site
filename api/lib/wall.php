<?php
// Community wall: anyone can leave a short note; nothing is public until the owner approves it.
//   GET  /wall            : approved notes (newest first)
//   POST /wall            : submit a note (pending), email the owner approve/reject links
//   POST /wall/heart      : add or remove a heart (one per visitor per note)
//   GET  /wall/moderate   : confirmation page from the owner's email link (no change on GET,
//   POST /wall/moderate     so mail scanners that prefetch links cannot approve anything)
declare(strict_types=1);

const WALL_KINDS = ['thanks', 'encourage', 'idea', 'shoutout'];
const WALL_COLOURS = ['sun', 'mint', 'sky', 'rose', 'lilac'];
const WALL_KIND_LABELS = ['thanks' => 'Thank you', 'encourage' => 'Encouragement', 'idea' => 'Idea', 'shoutout' => 'Shout-out'];

function wall_token(int $id, string $action): string
{
    return hash_hmac('sha256', "wall|$id|$action", (string) cfg('wall_secret', cfg('ip_salt', 'change-me')));
}

function wall_public(array $r): array
{
    return [
        'id' => (int) $r['id'], 'name' => $r['name'] ?: null, 'place' => $r['place'] ?: null, 'message' => $r['message'],
        'kind' => $r['kind'], 'colour' => $r['colour'], 'hearts' => (int) $r['hearts'], 'createdAt' => str_replace(' ', 'T', $r['created_at']) . 'Z',
    ];
}

function handle_wall_list(): never
{
    $q = db()->prepare("SELECT id, name, place, message, kind, colour, hearts, created_at FROM wall_notes WHERE status = 'approved' ORDER BY id DESC LIMIT 200");
    $q->execute();
    header('Cache-Control: public, max-age=30');
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['notes' => array_map('wall_public', $q->fetchAll())], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function handle_wall_post(): never
{
    $in = read_json_body(5000);
    if (($in['website'] ?? '') !== '') json_out(200, ['ok' => true, 'id' => 0]);      // honeypot
    if (($in['consent'] ?? false) !== true) json_out(422, ['error' => 'Please tick the box so we may show your note.']);

    $message = clean_text($in['message'] ?? '', 280);
    $name = one_line(clean_text($in['name'] ?? '', 40));
    $place = one_line(clean_text($in['place'] ?? '', 40));
    $kind = in_array($in['kind'] ?? '', WALL_KINDS, true) ? $in['kind'] : 'encourage';
    $colour = in_array($in['colour'] ?? '', WALL_COLOURS, true) ? $in['colour'] : 'sun';

    if (mb_strlen($message) < 3) json_out(422, ['error' => 'Write a few words first.']);
    // Keep the wall safe and spam-free: no links, emails or phone numbers on a public page.
    $all = "$message $name $place";
    if (preg_match('~(https?://|www\.|\b[\w.-]+\.(com|co\.za|net|org|io|xyz|link)\b)~i', $all)) json_out(422, ['error' => 'Links aren’t allowed on the wall. Please remove it and try again.']);
    if (preg_match('/[^\s@]+@[^\s@]+\.[a-z]{2,}/i', $all)) json_out(422, ['error' => 'Please leave out email addresses: the wall is public.']);
    if (preg_match('/(\+?\d[\s-]?){9,}/', $all)) json_out(422, ['error' => 'Please leave out phone numbers: the wall is public.']);
    if (rate_limited('wall', 3, 3600)) json_out(429, ['error' => 'You’ve left a few notes already. Please try again in an hour.']);

    $now = gmdate('Y-m-d H:i:s');
    db()->prepare("INSERT INTO wall_notes (created_at, name, place, message, kind, colour, status, hearts, ip_hash) VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, ?)")
        ->execute([$now, $name ?: null, $place ?: null, $message, $kind, $colour, ip_hash()]);
    $id = (int) db()->lastInsertId();

    $base = rtrim((string) cfg('api_public_url', 'https://api.tshedzawebdev.co.za'), '/');
    $link = fn(string $a) => "$base/wall/moderate?id=$id&a=$a&t=" . wall_token($id, $a);
    $who = ($name ?: 'Anonymous') . ($place ? ", $place" : '');
    $html = email_layout('New note for the wall', '<p style="line-height:1.6;margin:0 0 8px;color:#5f6b7a">' . h(WALL_KIND_LABELS[$kind]) . ' · from ' . h($who) . '</p>'
        . '<p style="line-height:1.6;margin:0 0 20px;font-size:18px;white-space:pre-wrap">' . h($message) . '</p>'
        . '<p style="margin:0"><a href="' . h($link('approve')) . '" style="display:inline-block;background:#0a1b2e;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Approve</a> '
        . '&nbsp; <a href="' . h($link('reject')) . '" style="display:inline-block;color:#b42318;padding:12px 8px;text-decoration:none;font-weight:600">Reject</a></p>');
    send_mail((string) cfg('owner_email'), "Wall note from $who", $html, "$who wrote:\n\n$message\n\nApprove: {$link('approve')}\nReject: {$link('reject')}");
    json_out(200, ['ok' => true, 'id' => $id]);
}

function handle_wall_heart(): never
{
    $in = read_json_body(500);
    $id = (int) ($in['id'] ?? 0);
    $on = ($in['on'] ?? true) === true;
    if (rate_limited('heart', 120, 3600)) json_out(429, ['error' => 'Slow down a little.']);
    $pdo = db();
    $q = $pdo->prepare("SELECT hearts FROM wall_notes WHERE id = ? AND status = 'approved'");
    $q->execute([$id]);
    if ($q->fetchColumn() === false) json_out(404, ['error' => 'Note not found.']);

    $has = $pdo->prepare('SELECT 1 FROM wall_hearts WHERE note_id = ? AND ip_hash = ?');
    $has->execute([$id, ip_hash()]);
    $exists = $has->fetchColumn() !== false;
    if ($on && !$exists) {
        $pdo->prepare('INSERT INTO wall_hearts (note_id, ip_hash, created_at) VALUES (?, ?, ?)')->execute([$id, ip_hash(), gmdate('Y-m-d H:i:s')]);
        $pdo->prepare('UPDATE wall_notes SET hearts = hearts + 1 WHERE id = ?')->execute([$id]);
    } elseif (!$on && $exists) {
        $pdo->prepare('DELETE FROM wall_hearts WHERE note_id = ? AND ip_hash = ?')->execute([$id, ip_hash()]);
        $pdo->prepare('UPDATE wall_notes SET hearts = CASE WHEN hearts > 0 THEN hearts - 1 ELSE 0 END WHERE id = ?')->execute([$id]);
    }
    $q->execute([$id]);
    json_out(200, ['hearts' => (int) $q->fetchColumn(), 'on' => $on]);
}

function handle_wall_moderate(): never
{
    $post = ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';
    $src = $post ? $_POST : $_GET;
    $id = (int) ($src['id'] ?? 0);
    $a = (string) ($src['a'] ?? '');
    $t = (string) ($src['t'] ?? '');
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'");
    $page = function (string $title, string $body) {
        echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . h($title) . '</title>'
            . '<body style="margin:0;background:#fafaf7;font-family:Segoe UI,Arial,sans-serif;color:#0a1b2e"><main style="max-width:520px;margin:48px auto;padding:0 16px">'
            . '<p style="font-weight:600">Tshedza<span style="color:#1da1c2">WebDev</span> · Wall</p>' . $body . '</main>';
        exit;
    };
    if (!in_array($a, ['approve', 'reject'], true) || !hash_equals(wall_token($id, $a), $t)) { http_response_code(403); $page('Link not valid', '<h1>This link is not valid.</h1>'); }
    $q = db()->prepare('SELECT * FROM wall_notes WHERE id = ?');
    $q->execute([$id]);
    $n = $q->fetch();
    if (!$n) { http_response_code(404); $page('Not found', '<h1>This note no longer exists.</h1>'); }

    $card = '<blockquote style="margin:16px 0;padding:20px;background:#fff;border:1px solid #e4e7ec;border-radius:14px;font-size:18px;line-height:1.5;white-space:pre-wrap">' . h($n['message'])
        . '<footer style="margin-top:10px;font-size:14px;color:#5f6b7a">' . h(($n['name'] ?: 'Anonymous') . ($n['place'] ? ', ' . $n['place'] : '')) . '</footer></blockquote>';
    if ($post) {
        db()->prepare('UPDATE wall_notes SET status = ?, approved_at = ? WHERE id = ?')->execute([$a === 'approve' ? 'approved' : 'rejected', $a === 'approve' ? gmdate('Y-m-d H:i:s') : null, $id]);
        $page('Done', '<h1>' . ($a === 'approve' ? 'Approved. It’s on the wall.' : 'Rejected. It will not be shown.') . '</h1>' . $card);
    }
    $label = $a === 'approve' ? 'Approve and publish' : 'Reject this note';
    $page($label, '<h1>' . h($label) . '?</h1><p style="color:#5f6b7a">Currently: ' . h($n['status']) . '</p>' . $card
        . '<form method="post"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="a" value="' . h($a) . '"><input type="hidden" name="t" value="' . h($t) . '">'
        . '<button style="font:inherit;font-weight:600;padding:12px 20px;border:0;border-radius:10px;cursor:pointer;color:#fff;background:' . ($a === 'approve' ? '#0a1b2e' : '#b42318') . '">' . h($label) . '</button></form>');
}
