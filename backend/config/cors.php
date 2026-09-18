<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Strictly limited to authentic Elephant House AR game domains and local
    | development environments to prevent unauthorized scraping & CSRF.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        'https://ai.loopsintegrated.co',
        'https://loopsintegrated.co',
        'http://localhost:3000',
        'http://localhost',
        'http://127.0.0.1:3000',
        'http://127.0.0.1',
    ],

    'allowed_origins_patterns' => [
        '#^https://.*\.loopsintegrated\.co$#',
        '#^http://(localhost|127\.0\.0\.1)(:[0-9]+)?$#',
    ],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-Admin-Token',
    ],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
