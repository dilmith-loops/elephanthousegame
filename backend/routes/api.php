<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\PopsicleController;
use App\Http\Middleware\AdminAuthMiddleware;
use Illuminate\Support\Facades\Route;

// Public Game Status & Heartbeat & Security
Route::get('/game/status', [PlayerController::class, 'status']);
Route::get('/security/inspect-status', [PlayerController::class, 'checkInspectPermission']);
Route::post('/player/ping', [PlayerController::class, 'ping']);
Route::get('/popsicles', [PopsicleController::class, 'index']);
Route::get('/popsicles/image/{filename}', [PopsicleController::class, 'serveImage']);

// Player Endpoints (Rate limited against abuse)
Route::post('/player/auth', [PlayerController::class, 'auth'])->middleware('throttle:30,1');

// Game Score Endpoints (Rate limited against bot submissions)
Route::post('/game/score', [ScoreController::class, 'submit'])->middleware('throttle:60,1');
Route::get('/leaderboard', [ScoreController::class, 'leaderboard']);

// Admin Authentication (Strictly rate-limited to 5 attempts per minute against brute-forcing)
Route::post('/admin/login', [AdminController::class, 'login'])->middleware('throttle:5,1');

// Protected Admin Endpoints - Enforced by AdminAuthMiddleware
Route::middleware([AdminAuthMiddleware::class])->prefix('admin')->group(function () {
    // Analytics & System
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::post('/maintenance', [AdminController::class, 'toggleMaintenance']);
    Route::post('/game-settings', [AdminController::class, 'updateGameSettings']);
    Route::get('/active-users', [AdminController::class, 'activeUsers']);
    Route::post('/password', [AdminController::class, 'updatePassword']);
    Route::get('/logs', [AdminController::class, 'logs']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/scores', [AdminController::class, 'scores']);
    Route::get('/export', [AdminController::class, 'export']);

    // Admin Popsicle Game Assets Management
    Route::get('/popsicles', [PopsicleController::class, 'adminIndex']);
    Route::post('/popsicles', [PopsicleController::class, 'store']);
    Route::post('/popsicles/{id}', [PopsicleController::class, 'update']);
    Route::put('/popsicles/{id}', [PopsicleController::class, 'update']);
    Route::post('/popsicles/{id}/toggle', [PopsicleController::class, 'toggle']);
    Route::delete('/popsicles/{id}', [PopsicleController::class, 'destroy']);

    // Admin Accounts Management
    Route::get('/admins', [AdminController::class, 'listAdmins']);
    Route::post('/admins', [AdminController::class, 'createAdmin']);
    Route::put('/admins/{id}', [AdminController::class, 'updateAdmin']);
    Route::delete('/admins/{id}', [AdminController::class, 'deleteAdmin']);

    // Admin IP Whitelist Management
    Route::get('/ip-whitelist', [AdminController::class, 'getIpWhitelist']);
    Route::post('/ip-whitelist', [AdminController::class, 'addIpToWhitelist']);
    Route::delete('/ip-whitelist', [AdminController::class, 'removeIpFromWhitelist']);

    // Players & Score Records Management
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::put('/scores/{id}', [AdminController::class, 'updateScore']);
    Route::delete('/scores/{id}', [AdminController::class, 'deleteScore']);
});

