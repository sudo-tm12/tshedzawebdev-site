<?php
// Shared setup for the API: config, JSON I/O, CORS, errors that never leak internals.
declare(strict_types=1);

ini_set('display_errors', '0');          // never show errors to visitors
ini_set('log_errors', '1');
header_remove('X-Powered-By');
error_reporting(E_ALL);

// Config lives OUTSIDE the web root (api/config.php, never committed). See config.example.php.
$configFile = getenv('TWD_API_CONFIG') ?: dirname(__DIR__) . '/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Service not configured']);
    exit;
}
/** @var array<string,mixed> $CONFIG */
$CONFIG = require $configFile;
ini_set('error_log', $CONFIG['error_log'] ?? dirname(__DIR__) . '/storage/api-error.log');

function cfg(string $key, mixed $default = null): mixed
{
    global $CONFIG;
    return $CONFIG[$key] ?? $default;
}

function json_out(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/** Only our own site may call the API from a browser. */
function cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = (array) cfg('allowed_origins', []);
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 600');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
    if ($origin !== '' && !in_array($origin, $allowed, true)) json_out(403, ['error' => 'Origin not allowed']);
}

function read_json_body(int $maxBytes = 20000): array
{
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (!str_starts_with(strtolower($type), 'application/json')) json_out(415, ['error' => 'JSON required']);
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || strlen($raw) > $maxBytes) json_out(413, ['error' => 'Request too large']);
    $data = json_decode($raw, true);
    if (!is_array($data)) json_out(400, ['error' => 'Invalid JSON']);
    return $data;
}

/** A salted hash of the client IP: lets us rate-limit without storing the IP itself. */
function ip_hash(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return hash('sha256', cfg('ip_salt', 'change-me') . '|' . $ip);
}

function clean_text(mixed $v, int $max): string
{
    $s = is_string($v) ? $v : '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';  // control chars
    return mb_substr(trim($s), 0, $max);
}

function one_line(string $s): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', $s) ?? '');                     // blocks header injection
}
