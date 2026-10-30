<?php
// Copy to api/config.php (OUTSIDE public/, never committed) and fill in.
return [
    'db_dsn'          => 'mysql:host=localhost;dbname=tshedzaw_site;charset=utf8mb4',
    'db_user'         => 'tshedzaw_site',          // a NEW user with access to this DB only
    'db_pass'         => 'CHANGE-ME',
    'allowed_origins' => ['https://tshedzawebdev.co.za', 'https://www.tshedzawebdev.co.za'],
    'ip_salt'         => 'CHANGE-ME-random-64-chars',
    'mail_transport'  => 'mail',                    // 'mail' (server mail) or 'outbox' (write .eml files, for testing)
    'mail_from'       => 'info@tshedzawebdev.co.za',
    'mail_from_name'  => 'TshedzaWebDev',
    'owner_email'     => 'info@tshedzawebdev.co.za',
    'api_public_url'  => 'https://api.tshedzawebdev.co.za',   // used in the wall's approve/reject email links
    'wall_secret'     => 'CHANGE-ME-another-random-64-chars', // signs those links
    'error_log'       => __DIR__ . '/storage/api-error.log',
];
