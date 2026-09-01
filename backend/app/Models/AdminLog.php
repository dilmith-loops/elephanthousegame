<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AdminLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'admin_id',
        'admin_email',
        'action',
        'description',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    /**
     * Helper to easily record an admin audit log
     */
    public static function record(?Admin $admin, string $action, ?string $description = null, ?Request $request = null): static
    {
        $ip = $request ? $request->ip() : request()->ip();
        $userAgent = $request ? $request->userAgent() : request()->userAgent();

        return static::create([
            'admin_id' => $admin?->id,
            'admin_email' => $admin?->email ?? 'System',
            'action' => $action,
            'description' => $description,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'created_at' => now(),
        ]);
    }
}
