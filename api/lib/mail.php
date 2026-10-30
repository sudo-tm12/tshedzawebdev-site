<?php
// Email: always FROM our own domain (SPF/DKIM aligned), the visitor only ever in
// Reply-To, every header value stripped of line breaks.
declare(strict_types=1);

/**
 * @param array{name:string,data:string,type:string}|null $attachment
 */
function send_mail(string $to, string $subject, string $html, string $text, ?string $replyTo = null, ?array $attachment = null): bool
{
    $to = one_line($to);
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
    $from = (string) cfg('mail_from');
    $fromName = one_line((string) cfg('mail_from_name', 'TshedzaWebDev'));
    $boundary = 'b' . bin2hex(random_bytes(12));
    $alt = 'a' . bin2hex(random_bytes(12));

    $headers = [
        'MIME-Version: 1.0',
        'From: ' . mb_encode_mimeheader($fromName) . " <$from>",
        'Date: ' . date(DATE_RFC2822),
        'Message-ID: <' . bin2hex(random_bytes(10)) . '@' . substr(strrchr($from, '@') ?: '@tshedzawebdev.co.za', 1) . '>',
    ];
    if ($replyTo !== null && filter_var(one_line($replyTo), FILTER_VALIDATE_EMAIL)) $headers[] = 'Reply-To: ' . one_line($replyTo);
    $headers[] = "Content-Type: multipart/mixed; boundary=\"$boundary\"";

    $body = "--$boundary\r\nContent-Type: multipart/alternative; boundary=\"$alt\"\r\n\r\n"
        . "--$alt\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text)) . "\r\n"
        . "--$alt\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html)) . "\r\n"
        . "--$alt--\r\n";
    if ($attachment) {
        $name = preg_replace('/[^A-Za-z0-9._-]/', '', $attachment['name']);
        $body .= "--$boundary\r\nContent-Type: {$attachment['type']}; name=\"$name\"\r\nContent-Disposition: attachment; filename=\"$name\"\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($attachment['data'])) . "\r\n";
    }
    $body .= "--$boundary--\r\n";
    $encodedSubject = mb_encode_mimeheader(one_line($subject), 'UTF-8');

    if (cfg('mail_transport') === 'outbox') {
        // Test mode: write the full message to storage/outbox instead of sending.
        $dir = dirname(__DIR__) . '/storage/outbox';
        if (!is_dir($dir)) mkdir($dir, 0700, true);
        $file = $dir . '/' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.eml';
        return file_put_contents($file, "To: $to\r\nSubject: $encodedSubject\r\n" . implode("\r\n", $headers) . "\r\n\r\n" . $body) !== false;
    }
    return mail($to, $encodedSubject, $body, implode("\r\n", $headers), '-f' . $from);
}

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** A simple, robust HTML email layout in our brand. */
function email_layout(string $title, string $inner): string
{
    return '<!doctype html><html><body style="margin:0;background:#fafaf7;font-family:Segoe UI,Arial,sans-serif;color:#0a1b2e">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">'
        . '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border:1px solid #e4e7ec;border-radius:14px">'
        . '<tr><td style="background:#0a1b2e;border-radius:14px 14px 0 0;padding:20px 28px;color:#fff;font-weight:600;font-size:16px">Tshedza<span style="color:#1da1c2">WebDev</span></td></tr>'
        . '<tr><td style="padding:28px"><h1 style="margin:0 0 12px;font-size:22px;line-height:1.25">' . h($title) . '</h1>' . $inner . '</td></tr>'
        . '<tr><td style="padding:18px 28px;border-top:1px solid #e4e7ec;color:#5f6b7a;font-size:12px">TshedzaWebDev · Pretoria · info@tshedzawebdev.co.za · WhatsApp 069 951 3836<br>Not VAT registered · All prices in South African rand</td></tr>'
        . '</table></td></tr></table></body></html>';
}
