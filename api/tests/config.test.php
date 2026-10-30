<?php
return [
    'db_dsn' => 'sqlite:' . __DIR__ . '/../storage/test.sqlite',
    'allowed_origins' => ['http://localhost:4711', 'https://tshedzawebdev.co.za'],
    'ip_salt' => 'test-salt',
    'mail_transport' => 'outbox',
    'mail_from' => 'info@tshedzawebdev.co.za',
    'mail_from_name' => 'TshedzaWebDev',
    'owner_email' => 'info@tshedzawebdev.co.za',
    'api_public_url' => 'http://127.0.0.1:4720',
    'wall_secret' => 'test-wall-secret',
    'error_log' => __DIR__ . '/../storage/api-error.log',
];
