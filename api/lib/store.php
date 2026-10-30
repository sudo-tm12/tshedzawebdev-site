<?php
// Storage: PDO with prepared statements only. MySQL in production, SQLite for local tests.
declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $pdo = new PDO((string) cfg('db_dsn'), (string) cfg('db_user', ''), (string) cfg('db_pass', ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    if (str_starts_with((string) cfg('db_dsn'), 'sqlite:')) {
        $pdo->exec((string) file_get_contents(dirname(__DIR__) . '/schema.sqlite.sql'));
    }
    return $pdo;
}

/** Sliding-window rate limit per hashed IP and action. */
function rate_limited(string $action, int $max, int $windowSeconds): bool
{
    $pdo = db();
    $since = gmdate('Y-m-d H:i:s', time() - $windowSeconds);
    $q = $pdo->prepare('SELECT COUNT(*) FROM rate_events WHERE action = ? AND ip_hash = ? AND created_at > ?');
    $q->execute([$action, ip_hash(), $since]);
    if ((int) $q->fetchColumn() >= $max) return true;
    $pdo->prepare('INSERT INTO rate_events (action, ip_hash, created_at) VALUES (?, ?, ?)')->execute([$action, ip_hash(), gmdate('Y-m-d H:i:s')]);
    return false;
}

/** Next estimate reference: EST-2026-0001. */
function next_ref(): string
{
    $year = gmdate('Y');
    $q = db()->prepare("SELECT COUNT(*) FROM leads WHERE ref LIKE ?");
    $q->execute(["EST-$year-%"]);
    return sprintf('EST-%s-%04d', $year, (int) $q->fetchColumn() + 1);
}
