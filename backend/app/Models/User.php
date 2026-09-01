<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'mobile',
        'email',
        'last_ip_address',
        'last_user_agent',
        'last_active_at',
    ];

    protected $casts = [
        'last_active_at' => 'datetime',
    ];

    public function scores()
    {
        return $this->hasMany(Score::class);
    }

    public function getHighestScoreAttribute()
    {
        return $this->scores()->max('score') ?? 0;
    }

    public function getTotalGamesAttribute()
    {
        return $this->scores()->count();
    }
}
