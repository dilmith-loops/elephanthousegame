<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Admin;

class AdminAuthMiddleware
{
    /**
     * Handle an incoming request and enforce admin token authentication.
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken() ?? $request->header('X-Admin-Token') ?? $request->query('token');

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Admin authentication token required.',
            ], 401);
        }

        $hashed = hash('sha256', $token);
        $admin = Admin::where('api_token', $hashed)->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Invalid or expired admin token.',
            ], 401);
        }

        // Attach authenticated admin to request attributes for controllers
        $request->attributes->set('authenticated_admin', $admin);

        return $next($request);
    }
}
