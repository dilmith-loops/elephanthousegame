<?php
/**
 * Elephant House AR Game — Unified Root Router for Hostinger
 * Directs API traffic to Laravel backend
 */
@ini_set('expose_php', '0');
header_remove('X-Powered-By');
require_once __DIR__ . '/backend/public/index.php';

