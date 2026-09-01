<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\PopsicleController;
use Illuminate\Support\Facades\Route;

// Public Game Status & Heartbeat
Route::get('/game/status', [PlayerController::class, 'status']);
Route::post('/player/ping', [PlayerController::class, 'ping']);
Route::get('/popsicles', [PopsicleController::class, 'index']);

// Player Endpoints
Route::post('/player/auth', [PlayerController::class, 'auth']);

// Game Score Endpoints
Route::post('/game/score', [ScoreController::class, 'submit']);
Route::get('/leaderboard', [ScoreController::class, 'leaderboard']);

// Admin Endpoints
Route::post('/admin/login', [AdminController::class, 'login']);
Route::get('/admin/stats', [AdminController::class, 'stats']);
Route::post('/admin/maintenance', [AdminController::class, 'toggleMaintenance']);
Route::get('/admin/active-users', [AdminController::class, 'activeUsers']);
Route::post('/admin/password', [AdminController::class, 'updatePassword']);
Route::get('/admin/logs', [AdminController::class, 'logs']);
Route::get('/admin/users', [AdminController::class, 'users']);
Route::get('/admin/scores', [AdminController::class, 'scores']);
Route::get('/admin/export', [AdminController::class, 'export']);

// Admin Popsicle Game Assets Management
Route::get('/admin/popsicles', [PopsicleController::class, 'adminIndex']);
Route::post('/admin/popsicles', [PopsicleController::class, 'store']);
Route::post('/admin/popsicles/{id}', [PopsicleController::class, 'update']);
Route::put('/admin/popsicles/{id}', [PopsicleController::class, 'update']);
Route::post('/admin/popsicles/{id}/toggle', [PopsicleController::class, 'toggle']);
Route::delete('/admin/popsicles/{id}', [PopsicleController::class, 'destroy']);

// Admin Accounts Management
Route::get('/admin/admins', [AdminController::class, 'listAdmins']);
Route::post('/admin/admins', [AdminController::class, 'createAdmin']);
Route::put('/admin/admins/{id}', [AdminController::class, 'updateAdmin']);
Route::delete('/admin/admins/{id}', [AdminController::class, 'deleteAdmin']);

// Players & Score Records Management (Edit & Delete)
Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
Route::delete('/admin/scores/{id}', [AdminController::class, 'deleteScore']);
