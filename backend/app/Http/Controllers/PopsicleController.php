<?php

namespace App\Http\Controllers;

use App\Models\Popsicle;
use App\Models\AdminLog;
use App\Models\AdminUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

class PopsicleController extends Controller
{
    /**
     * Public API: Get all active popsicles for game canvas
     */
    public function index()
    {
        $popsicles = Popsicle::where('is_active', true)
            ->orderBy('spawn_weight', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'popsicles' => $popsicles,
        ]);
    }

    /**
     * Admin API: List all popsicles with statistics
     */
    public function adminIndex(Request $request)
    {
        $popsicles = Popsicle::orderBy('is_active', 'desc')
            ->orderBy('id', 'asc')
            ->get();

        $stats = [
            'total' => $popsicles->count(),
            'active' => $popsicles->where('is_active', true)->count(),
            'custom_images' => $popsicles->whereNotNull('image_path')->count(),
            'max_points' => $popsicles->max('points') ?? 0,
            'total_weight' => $popsicles->where('is_active', true)->sum('spawn_weight'),
        ];

        return response()->json([
            'success' => true,
            'popsicles' => $popsicles,
            'stats' => $stats,
        ]);
    }

    /**
     * Admin API: Create a new popsicle
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'flavor' => 'nullable|string|max:100',
                'type_key' => 'nullable|string|max:50',
                'points' => 'required|integer|min:1|max:50',
                'speed_multiplier' => 'nullable|numeric|min:0.5|max:3.0',
                'spawn_weight' => 'required|integer|min:1|max:1000',
                'primary_color' => 'nullable|string|max:20',
                'secondary_color' => 'nullable|string|max:20',
                'is_active' => 'nullable',
                'image' => 'nullable|file|mimes:png,jpg,jpeg,svg,webp|max:5120', // 5MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $uploadDir = public_path('uploads/popsicles');
                if (!File::isDirectory($uploadDir)) {
                    File::makeDirectory($uploadDir, 0755, true, true);
                }
                $filename = 'popsicle_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move($uploadDir, $filename);
                $imagePath = 'uploads/popsicles/' . $filename;
            }

            $popsicle = Popsicle::create([
                'name' => trim($request->name),
                'flavor' => $request->flavor ? trim($request->flavor) : null,
                'type_key' => $request->type_key ?? 'custom',
                'points' => (int)$request->points,
                'speed_multiplier' => (float)($request->speed_multiplier ?? 1.0),
                'spawn_weight' => (int)$request->spawn_weight,
                'image_path' => $imagePath,
                'primary_color' => $request->primary_color ?? '#E91E63',
                'secondary_color' => $request->secondary_color ?? '#FFD200',
                'is_active' => filter_var($request->is_active ?? true, FILTER_VALIDATE_BOOLEAN),
            ]);

            // Audit Log
            try {
                $token = $request->bearerToken() ?: $request->header('X-Admin-Token');
                $admin = $token ? AdminUser::where('api_token', $token)->first() : null;
                AdminLog::record($admin, 'create_popsicle', "Created new popsicle asset: {$popsicle->name} ({$popsicle->points} pts)", $request);
            } catch (\Throwable $e) {
                // Ignore audit log error
            }

            return response()->json([
                'success' => true,
                'message' => "Popsicle '{$popsicle->name}' created successfully!",
                'popsicle' => $popsicle,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error saving popsicle: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin API: Update existing popsicle
     */
    public function update(Request $request, $id)
    {
        try {
            $popsicle = Popsicle::find($id);
            if (!$popsicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Popsicle asset not found.',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'flavor' => 'nullable|string|max:100',
                'type_key' => 'nullable|string|max:50',
                'points' => 'required|integer|min:1|max:50',
                'speed_multiplier' => 'nullable|numeric|min:0.5|max:3.0',
                'spawn_weight' => 'required|integer|min:1|max:1000',
                'primary_color' => 'nullable|string|max:20',
                'secondary_color' => 'nullable|string|max:20',
                'is_active' => 'nullable',
                'remove_image' => 'nullable',
                'image' => 'nullable|file|mimes:png,jpg,jpeg,svg,webp|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            if (filter_var($request->remove_image, FILTER_VALIDATE_BOOLEAN) && $popsicle->image_path) {
                $oldFilePath = public_path($popsicle->image_path);
                if (File::exists($oldFilePath)) {
                    File::delete($oldFilePath);
                }
                $popsicle->image_path = null;
            }

            if ($request->hasFile('image')) {
                // Remove previous image if exists
                if ($popsicle->image_path) {
                    $oldFilePath = public_path($popsicle->image_path);
                    if (File::exists($oldFilePath)) {
                        File::delete($oldFilePath);
                    }
                }

                $file = $request->file('image');
                $uploadDir = public_path('uploads/popsicles');
                if (!File::isDirectory($uploadDir)) {
                    File::makeDirectory($uploadDir, 0755, true, true);
                }
                $filename = 'popsicle_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move($uploadDir, $filename);
                $popsicle->image_path = 'uploads/popsicles/' . $filename;
            }

            $popsicle->name = trim($request->name);
            $popsicle->flavor = $request->flavor ? trim($request->flavor) : null;
            if ($request->filled('type_key')) {
                $popsicle->type_key = $request->type_key;
            }
            $popsicle->points = (int)$request->points;
            $popsicle->speed_multiplier = (float)($request->speed_multiplier ?? $popsicle->speed_multiplier);
            $popsicle->spawn_weight = (int)$request->spawn_weight;
            if ($request->filled('primary_color')) {
                $popsicle->primary_color = $request->primary_color;
            }
            if ($request->filled('secondary_color')) {
                $popsicle->secondary_color = $request->secondary_color;
            }
            if ($request->has('is_active')) {
                $popsicle->is_active = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            }
            $popsicle->save();

            // Audit Log
            try {
                $token = $request->bearerToken() ?: $request->header('X-Admin-Token');
                $admin = $token ? AdminUser::where('api_token', $token)->first() : null;
                AdminLog::record($admin, 'update_popsicle', "Updated popsicle asset: {$popsicle->name}", $request);
            } catch (\Throwable $e) {
                // Ignore audit log error
            }

            return response()->json([
                'success' => true,
                'message' => "Popsicle '{$popsicle->name}' updated successfully!",
                'popsicle' => $popsicle,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating popsicle: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin API: Toggle active status
     */
    public function toggle(Request $request, $id)
    {
        try {
            $popsicle = Popsicle::find($id);
            if (!$popsicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Popsicle asset not found.',
                ], 404);
            }

            $popsicle->is_active = !$popsicle->is_active;
            $popsicle->save();

            $statusStr = $popsicle->is_active ? 'Activated' : 'Deactivated';
            try {
                $token = $request->bearerToken() ?: $request->header('X-Admin-Token');
                $admin = $token ? AdminUser::where('api_token', $token)->first() : null;
                AdminLog::record($admin, 'toggle_popsicle', "{$statusStr} popsicle: {$popsicle->name}", $request);
            } catch (\Throwable $e) {
                // Ignore audit log error
            }

            return response()->json([
                'success' => true,
                'message' => "Popsicle '{$popsicle->name}' {$statusStr} successfully!",
                'popsicle' => $popsicle,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error toggling popsicle: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin API: Delete popsicle
     */
    public function destroy(Request $request, $id)
    {
        try {
            $popsicle = Popsicle::find($id);
            if (!$popsicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Popsicle asset not found.',
                ], 404);
            }

            // Prevent deleting if it's the only active popsicle
            $activeCount = Popsicle::where('is_active', true)->where('id', '!=', $id)->count();
            if ($popsicle->is_active && $activeCount === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the only active popsicle in the game. Please activate another popsicle first.',
                ], 422);
            }

            if ($popsicle->image_path) {
                $filePath = public_path($popsicle->image_path);
                if (File::exists($filePath)) {
                    File::delete($filePath);
                }
            }

            $name = $popsicle->name;
            $popsicle->delete();

            // Audit Log
            try {
                $token = $request->bearerToken() ?: $request->header('X-Admin-Token');
                $admin = $token ? AdminUser::where('api_token', $token)->first() : null;
                AdminLog::record($admin, 'delete_popsicle', "Deleted popsicle asset: {$name}", $request);
            } catch (\Throwable $e) {
                // Ignore audit log error
            }

            return response()->json([
                'success' => true,
                'message' => "Popsicle '{$name}' deleted successfully!",
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting popsicle: ' . $e->getMessage(),
            ], 500);
        }
    }
}
