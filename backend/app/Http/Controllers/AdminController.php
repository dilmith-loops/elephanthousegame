<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLog;
use App\Models\Score;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Admin login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        // Generate api_token
        $token = Str::random(60);
        $admin->api_token = hash('sha256', $token);
        $admin->save();

        // Audit Log
        AdminLog::record($admin, 'login', "Admin logged in successfully ({$admin->email})", $request);

        return response()->json([
            'success' => true,
            'message' => 'Admin authentication successful.',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }

    /**
     * Helper to authenticate token
     */
    private function authenticateAdmin(Request $request)
    {
        $token = $request->bearerToken() ?? $request->query('token');
        if (!$token) {
            return null;
        }

        $hashed = hash('sha256', $token);
        return Admin::where('api_token', $hashed)->first();
    }

    /**
     * Admin Dashboard KPI Statistics & Settings
     */
    public function stats(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $totalUsers = User::count();
        $totalGames = Score::count();
        $todayGames = Score::whereDate('created_at', Carbon::today())->count();
        $highestScore = Score::max('score') ?? 0;
        $avgScore = round(Score::avg('score') ?? 0, 1);
        $activeUsersCount = User::where('last_active_at', '>=', now()->subMinutes(15))->count();

        $isMaintenance = Setting::get('maintenance_mode', '0') === '1';
        $maintenanceMessage = Setting::get(
            'maintenance_message',
            'The Elephant House AR Game is currently undergoing scheduled maintenance. Please check back shortly!'
        );

        return response()->json([
            'success' => true,
            'stats' => [
                'total_users' => $totalUsers,
                'total_games' => $totalGames,
                'today_games' => $todayGames,
                'active_users_count' => $activeUsersCount,
                'highest_score' => $highestScore,
                'average_score' => $avgScore,
                'maintenance_mode' => $isMaintenance,
                'maintenance_message' => $maintenanceMessage,
            ],
        ]);
    }

    /**
     * Active Users List with IP Addresses
     */
    public function activeUsers(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $search = $request->query('search');
        $limit = (int) $request->query('limit', 20);

        $query = User::select('users.*',
            DB::raw('COALESCE(MAX(scores.score), 0) as highest_score'),
            DB::raw('COUNT(scores.id) as total_games')
        )
        ->leftJoin('scores', 'users.id', '=', 'scores.user_id')
        ->groupBy('users.id', 'users.name', 'users.mobile', 'users.email', 'users.last_ip_address', 'users.last_user_agent', 'users.last_active_at', 'users.created_at', 'users.updated_at')
        ->orderByRaw('users.last_active_at DESC, users.created_at DESC');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                  ->orWhere('users.mobile', 'like', "%{$search}%")
                  ->orWhere('users.last_ip_address', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($limit);

        // Append real-time status (online if active in last 5 min, idle if last 30 min, offline otherwise)
        $now = now();
        $users->getCollection()->transform(function ($user) use ($now) {
            $status = 'offline';
            if ($user->last_active_at) {
                $diffMinutes = $now->diffInMinutes($user->last_active_at);
                if ($diffMinutes <= 5) {
                    $status = 'online';
                } elseif ($diffMinutes <= 30) {
                    $status = 'idle';
                }
            }
            $user->status = $status;
            return $user;
        });

        return response()->json([
            'success' => true,
            'active_users' => $users,
        ]);
    }

    /**
     * Update Admin Password
     */
    public function updatePassword(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password does not match.',
            ], 422);
        }

        $admin->password = Hash::make($request->new_password);
        $admin->save();

        // Audit Log
        AdminLog::record($admin, 'change_password', 'Admin updated their login password', $request);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully!',
        ]);
    }

    /**
     * List all Admin Accounts
     */
    public function listAdmins(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $admins = Admin::select('id', 'name', 'email', 'created_at')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'current_admin_id' => $admin->id,
            'admins' => $admins,
        ]);
    }

    /**
     * Create a New Admin User
     */
    public function createAdmin(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:admins,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $newAdmin = Admin::create([
            'name' => $request->name,
            'email' => strtolower($request->email),
            'password' => Hash::make($request->password),
        ]);

        // Audit Log
        AdminLog::record($admin, 'create_admin', "Created new admin account: {$newAdmin->email} ({$newAdmin->name})", $request);

        return response()->json([
            'success' => true,
            'message' => "Admin user '{$newAdmin->name}' created successfully!",
            'admin' => [
                'id' => $newAdmin->id,
                'name' => $newAdmin->name,
                'email' => $newAdmin->email,
                'created_at' => $newAdmin->created_at,
            ],
        ]);
    }

    /**
     * Delete an Admin User
     */
    public function deleteAdmin(Request $request, $id)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $targetAdmin = Admin::find($id);
        if (!$targetAdmin) {
            return response()->json(['success' => false, 'message' => 'Admin user not found.'], 404);
        }

        if ($targetAdmin->id === $admin->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own active admin account.',
            ], 422);
        }

        if (Admin::count() <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the only remaining administrator account.',
            ], 422);
        }

        $targetEmail = $targetAdmin->email;
        $targetAdmin->delete();

        // Audit Log
        AdminLog::record($admin, 'delete_admin', "Deleted admin account: {$targetEmail}", $request);

        return response()->json([
            'success' => true,
            'message' => "Admin account '{$targetEmail}' deleted successfully.",
        ]);
    }

    /**
     * Update an Admin User
     */
    public function updateAdmin(Request $request, $id)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $targetAdmin = Admin::find($id);
        if (!$targetAdmin) {
            return response()->json(['success' => false, 'message' => 'Admin user not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:admins,email,' . $id,
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $targetAdmin->name = $request->name;
        $targetAdmin->email = strtolower($request->email);
        if ($request->filled('password')) {
            $targetAdmin->password = Hash::make($request->password);
        }
        $targetAdmin->save();

        // Audit Log
        AdminLog::record($admin, 'update_admin', "Updated admin account details: {$targetAdmin->email}", $request);

        return response()->json([
            'success' => true,
            'message' => "Admin '{$targetAdmin->name}' updated successfully.",
            'admin' => [
                'id' => $targetAdmin->id,
                'name' => $targetAdmin->name,
                'email' => $targetAdmin->email,
                'created_at' => $targetAdmin->created_at,
            ],
        ]);
    }

    /**
     * Update a Registered Player User
     */
    public function updateUser(Request $request, $id)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Player not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'mobile' => 'required|string|max:20|unique:users,mobile,' . $id,
            'email' => 'nullable|email|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->name = $request->name;
        $user->mobile = $request->mobile;
        $user->email = $request->email ? strtolower($request->email) : null;
        $user->save();

        // Audit Log
        AdminLog::record($admin, 'update_player', "Updated player details for {$user->name} ({$user->mobile})", $request);

        return response()->json([
            'success' => true,
            'message' => "Player '{$user->name}' updated successfully.",
            'user' => $user,
        ]);
    }

    /**
     * Delete a Registered Player User & Score History
     */
    public function deleteUser(Request $request, $id)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Player not found.'], 404);
        }

        $userName = $user->name;
        $userMobile = $user->mobile;

        // Delete associated scores
        Score::where('user_id', $id)->delete();
        $user->delete();

        // Audit Log
        AdminLog::record($admin, 'delete_player', "Deleted player {$userName} ({$userMobile}) and all score records", $request);

        return response()->json([
            'success' => true,
            'message' => "Player '{$userName}' and score history deleted successfully.",
        ]);
    }

    /**
     * Delete a Score Record
     */
    public function deleteScore(Request $request, $id)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $score = Score::with('user')->find($id);
        if (!$score) {
            return response()->json(['success' => false, 'message' => 'Score record not found.'], 404);
        }

        $playerName = $score->user->name ?? 'User #' . $score->user_id;
        $scoreMarks = $score->score;
        $score->delete();

        // Audit Log
        AdminLog::record($admin, 'delete_score', "Deleted score log #{$id} ({$scoreMarks} marks for {$playerName})", $request);

        return response()->json([
            'success' => true,
            'message' => "Score record #{$id} deleted successfully.",
        ]);
    }

    /**
     * Admin Activity Audit Logs
     */
    public function logs(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $limit = (int) $request->query('limit', 20);
        $logs = AdminLog::orderByDesc('created_at')->paginate($limit);

        return response()->json([
            'success' => true,
            'logs' => $logs,
        ]);
    }

    /**
     * Toggle Maintenance Mode (Enable / Disable)
     */
    public function toggleMaintenance(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $enabled = filter_var($request->input('enabled'), FILTER_VALIDATE_BOOLEAN);
        Setting::set('maintenance_mode', $enabled ? '1' : '0');

        if ($request->has('message')) {
            Setting::set('maintenance_message', $request->input('message'));
        }

        // Audit Log
        AdminLog::record(
            $admin,
            'maintenance_toggle',
            $enabled ? 'Enabled maintenance mode (game locked)' : 'Disabled maintenance mode (game live)',
            $request
        );

        return response()->json([
            'success' => true,
            'message' => $enabled ? 'Maintenance mode enabled. Game is now paused for all players.' : 'Maintenance mode disabled. Game is now live.',
            'maintenance_mode' => $enabled,
            'maintenance_message' => Setting::get('maintenance_message'),
        ]);
    }

    /**
     * Paginated Users with search and high scores
     */
    public function users(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $search = $request->query('search');
        $limit = (int) $request->query('limit', 15);

        $query = User::select('users.id', 'users.name', 'users.mobile', 'users.email', 'users.last_ip_address', 'users.last_active_at', 'users.created_at',
            DB::raw('COALESCE(MAX(scores.score), 0) as highest_score'),
            DB::raw('COUNT(scores.id) as total_games')
        )
        ->leftJoin('scores', 'users.id', '=', 'scores.user_id')
        ->groupBy('users.id', 'users.name', 'users.mobile', 'users.email', 'users.last_ip_address', 'users.last_active_at', 'users.created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                  ->orWhere('users.mobile', 'like', "%{$search}%")
                  ->orWhere('users.email', 'like', "%{$search}%")
                  ->orWhere('users.last_ip_address', 'like', "%{$search}%");
            });
        }

        $query->orderByDesc('highest_score');

        $users = $query->paginate($limit);

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * Paginated Scores
     */
    public function scores(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $search = $request->query('search');
        $limit = (int) $request->query('limit', 15);

        $query = Score::with('user:id,name,mobile,email,last_ip_address')->orderByDesc('created_at');

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $scores = $query->paginate($limit);

        return response()->json([
            'success' => true,
            'scores' => $scores,
        ]);
    }

    /**
     * Export data to CSV
     */
    public function export(Request $request)
    {
        $admin = $this->authenticateAdmin($request);
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $type = $request->query('type', 'users');

        // Audit Log
        AdminLog::record($admin, 'export_csv', "Exported {$type} CSV report", $request);

        if ($type === 'scores') {
            $scores = Score::with('user')->orderByDesc('created_at')->get();
            $csvHeader = ['Score ID', 'Player Name', 'Mobile Number', 'Email', 'Player IP', 'Marks (Score)', 'Popsicles Caught', 'Duration (Seconds)', 'Played Date & Time'];

            $callback = function () use ($scores, $csvHeader) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $csvHeader);

                foreach ($scores as $row) {
                    fputcsv($file, [
                        $row->id,
                        $row->user->name ?? 'N/A',
                        $row->user->mobile ?? 'N/A',
                        $row->user->email ?? 'N/A',
                        $row->user->last_ip_address ?? 'N/A',
                        $row->score,
                        $row->popsicles_caught,
                        $row->duration_seconds,
                        $row->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="elephant_house_scores_' . date('Y-m-d') . '.csv"',
            ]);
        }

        // Default: Export Users
        $users = User::select('users.*',
            DB::raw('COALESCE(MAX(scores.score), 0) as highest_score'),
            DB::raw('COUNT(scores.id) as total_games')
        )
        ->leftJoin('scores', 'users.id', '=', 'scores.user_id')
        ->groupBy('users.id', 'users.name', 'users.mobile', 'users.email', 'users.last_ip_address', 'users.last_user_agent', 'users.last_active_at', 'users.created_at', 'users.updated_at')
        ->orderByDesc('highest_score')
        ->get();

        $csvHeader = ['User ID', 'Name', 'Mobile Number', 'Last IP Address', 'Highest Score', 'Total Games Played', 'Registered Date'];

        $callback = function () use ($users, $csvHeader) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $csvHeader);

            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name,
                    $user->mobile,
                    $user->last_ip_address ?? 'N/A',
                    $user->highest_score,
                    $user->total_games,
                    $user->created_at->format('Y-m-d H:i:s'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="elephant_house_players_' . date('Y-m-d') . '.csv"',
        ]);
    }
}
