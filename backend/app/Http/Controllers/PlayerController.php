<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlayerController extends Controller
{
    /**
     * Get game status / maintenance mode
     */
    public function status()
    {
        $isMaintenance = Setting::get('maintenance_mode', '0') === '1';
        $message = Setting::get(
            'maintenance_message',
            'The Elephant House AR Game is currently undergoing scheduled maintenance. Please check back shortly!'
        );
        $gameDuration = (int) Setting::get('game_duration', '60');
        $timerEnabled = Setting::get('timer_enabled', '1') === '1';

        return response()->json([
            'success' => true,
            'maintenance_mode' => $isMaintenance,
            'maintenance_message' => $message,
            'game_duration' => $gameDuration,
            'timer_enabled' => $timerEnabled,
        ]);
    }

    /**
     * Player Active Session Heartbeat Ping
     */
    public function ping(Request $request)
    {
        $userId = $request->input('user_id');
        if ($userId) {
            $user = User::find($userId);
            if ($user) {
                $user->last_ip_address = $request->ip();
                $user->last_user_agent = $request->userAgent();
                $user->last_active_at = now();
                $user->save();
            }
        }

        return response()->json([
            'success' => true,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Authenticate or register a player.
     */
    public function auth(Request $request)
    {
        // Check maintenance mode
        if (Setting::get('maintenance_mode', '0') === '1') {
            return response()->json([
                'success' => false,
                'maintenance_mode' => true,
                'message' => Setting::get(
                    'maintenance_message',
                    'The Elephant House AR Game is currently undergoing scheduled maintenance.'
                ),
            ], 503);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'mobile' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $name = trim($request->name);
        $mobile = $request->filled('mobile') ? preg_replace('/[\s-]/', '', $request->mobile) : null;
        $email = $request->filled('email') ? trim($request->email) : null;

        // Find existing user by mobile (if supplied) or by name
        if ($mobile) {
            $user = User::where('mobile', $mobile)->first();
        } else {
            $user = User::where('name', $name)->first();
        }

        if ($user) {
            $user->name = $name;
            if ($email) $user->email = $email;
            if ($mobile) $user->mobile = $mobile;
            $user->last_ip_address = $request->ip();
            $user->last_user_agent = $request->userAgent();
            $user->last_active_at = now();
            $user->save();

            $highestScore = $user->scores()->max('score') ?? 0;
            $totalGames = $user->scores()->count();

            return response()->json([
                'success' => true,
                'isNewUser' => false,
                'message' => 'Welcome back, ' . $user->name . '!',
                'player' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'mobile' => $user->mobile,
                    'email' => $user->email,
                    'last_ip_address' => $user->last_ip_address,
                    'last_active_at' => $user->last_active_at,
                    'highest_score' => $highestScore,
                    'total_games' => $totalGames,
                    'created_at' => $user->created_at,
                ],
            ]);
        }

        // New user
        $user = User::create([
            'name' => $name,
            'mobile' => $mobile,
            'email' => $email,
            'last_ip_address' => $request->ip(),
            'last_user_agent' => $request->userAgent(),
            'last_active_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'isNewUser' => true,
            'message' => 'Welcome to Elephant House AR Game, ' . $user->name . '!',
            'player' => [
                'id' => $user->id,
                'name' => $user->name,
                'mobile' => $user->mobile,
                'email' => $user->email,
                'last_ip_address' => $user->last_ip_address,
                'last_active_at' => $user->last_active_at,
                'highest_score' => 0,
                'total_games' => 0,
                'created_at' => $user->created_at,
            ],
        ]);
    }
}
