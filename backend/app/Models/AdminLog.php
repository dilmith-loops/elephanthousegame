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
        return $this->belongsTo(AdminUser::class, 'admin_id');
    }

    /**
     * Helper to easily record an admin audit log
     */
    public static function record($admin = null, string $action = 'action', ?string $description = null, ?Request $request = null): static
    {
        $ip = $request ? $request->ip() : request()->ip();
        $userAgent = $request ? $request->userAgent() : request()->userAgent();

        $adminId = is_object($admin) ? ($admin->id ?? null) : null;
        $adminEmail = is_object($admin) ? ($admin->email ?? 'System') : (is_string($admin) ? $admin : 'System');

        return static::create([
            'admin_id' => $adminId,
            'admin_email' => $adminEmail,
            'action' => $action,
            'description' => $description,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'created_at' => now(),
        ]);
    }
}
