<?php
/**
 * Elephant House AR Game — Unified Root Router
 * Serves Next.js frontend or delegates API traffic to Laravel backend
 */
@ini_set('expose_php', '0');
header_remove('X-Powered-By');

$uri = $_SERVER['REQUEST_URI'] ?? '';

// 1. If requesting API or uploads, forward to Laravel Backend
if (preg_match('#/(api|uploads)(/|\?|$)#', $uri)) {
    // Normalize REQUEST_URI so Laravel's router always receives /api/... or /uploads/...
    // even when hosted in a subfolder like /arwonder/api/...
    if (preg_match('#/(api|uploads)(.*)$#', $uri, $matches)) {
        $_SERVER['REQUEST_URI'] = '/' . $matches[1] . $matches[2];
    }

    if (file_exists(__DIR__ . '/backend/public/index.php')) {
        if (!file_exists(__DIR__ . '/backend/vendor/autoload.php')) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(503);
            echo json_encode([
                'status' => 'setup_required',
                'message' => 'Backend composer dependencies are not yet installed. Please run "composer install --no-dev" in public_html/arwonder/backend/ or upload vendor.zip.',
            ]);
            exit;
        }
        require_once __DIR__ . '/backend/public/index.php';
        exit;
    }
}

// 2. If DirectoryIndex falls back to index.php or index.php is loaded directly, serve frontend
if (file_exists(__DIR__ . '/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/index.html');
    exit;
}

$frontendOut = __DIR__ . '/frontend/out/index.html';
if (file_exists($frontendOut)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($frontendOut);
    exit;
}

// 3. Fallback to Laravel backend
if (file_exists(__DIR__ . '/backend/public/index.php')) {
    require_once __DIR__ . '/backend/public/index.php';
    exit;
}

http_response_code(404);
echo "Elephant House AR Game: Application file not found.";
