<?php

namespace App\Http\Controllers;

use App\Models\Score;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ScoreController extends Controller
{
    /**
     * Submit game session score
     */
    public function submit(Request $request)
    {
        if (\App\Models\Setting::get('maintenance_mode', '0') === '1') {
            return response()->json([
                'success' => false,
                'maintenance_mode' => true,
                'message' => 'Game is currently under maintenance. Scores cannot be submitted.',
            ], 503);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'score' => 'required|integer|min:0',
            'popsicles_caught' => 'required|integer|min:0',
            'duration_seconds' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $score = Score::create([
            'user_id' => $request->user_id,
            'score' => $request->score,
            'popsicles_caught' => $request->popsicles_caught,
            'duration_seconds' => $request->duration_seconds,
        ]);

        // Calculate personal best
        $personalBest = Score::where('user_id', $request->user_id)->max('score');

        // Calculate current rank based on highest score per user
        $higherUsersCount = DB::table('scores')
            ->select('user_id', DB::raw('MAX(score) as high_score'))
            ->groupBy('user_id')
            ->havingRaw('MAX(score) > ?', [$request->score])
            ->get()
            ->count();

        $rank = $higherUsersCount + 1;

        return response()->json([
            'success' => true,
            'message' => 'Score recorded successfully!',
            'score' => $score,
            'personal_best' => $personalBest,
            'rank' => $rank,
        ]);
    }

    /**
     * Get top player leaderboard
     */
    public function leaderboard(Request $request)
    {
        $limit = $request->query('limit', 10);

        // Fetch top players by their highest score
        $leaderboard = User::select('users.id', 'users.name', 'users.mobile', DB::raw('MAX(scores.score) as highest_score'), DB::raw('COUNT(scores.id) as total_games'))
            ->join('scores', 'users.id', '=', 'scores.user_id')
            ->groupBy('users.id', 'users.name', 'users.mobile')
            ->orderByDesc('highest_score')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'leaderboard' => $leaderboard,
        ]);
    }
}
