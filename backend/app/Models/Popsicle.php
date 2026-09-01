<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Popsicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'flavor',
        'type_key',
        'points',
        'speed_multiplier',
        'spawn_weight',
        'image_path',
        'primary_color',
        'secondary_color',
        'is_active',
    ];

    protected $casts = [
        'points' => 'integer',
        'speed_multiplier' => 'float',
        'spawn_weight' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = ['image_url'];

    /**
     * Get accessible image URL if custom image uploaded
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
            return $this->image_path;
        }

        return url($this->image_path);
    }
}
