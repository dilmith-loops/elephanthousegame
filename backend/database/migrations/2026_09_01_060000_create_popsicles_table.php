<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('popsicles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('flavor', 100)->nullable();
            $table->string('type_key', 50)->default('chocobar'); // chocobar, berry_rocket, mango_pop, twister, wonder_cone, golden_star, custom
            $table->integer('points')->default(1);
            $table->decimal('speed_multiplier', 4, 2)->default(1.00);
            $table->integer('spawn_weight')->default(100); // Higher = more frequent
            $table->string('image_path')->nullable();
            $table->string('primary_color', 20)->default('#E91E63');
            $table->string('secondary_color', 20)->default('#FFD200');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed initial default Elephant House popsicles
        DB::table('popsicles')->insert([
            [
                'name' => 'Choco Crunch',
                'flavor' => 'Rich Chocolate & Crispy Rice',
                'type_key' => 'chocobar',
                'points' => 1,
                'speed_multiplier' => 1.00,
                'spawn_weight' => 100,
                'image_path' => null,
                'primary_color' => '#3E2723',
                'secondary_color' => '#FFF8E1',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Berry Rocket',
                'flavor' => 'Triple Layer Raspberry Blast',
                'type_key' => 'berry_rocket',
                'points' => 1,
                'speed_multiplier' => 1.05,
                'spawn_weight' => 90,
                'image_path' => null,
                'primary_color' => '#E91E63',
                'secondary_color' => '#00E5FF',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mango Blast',
                'flavor' => 'Tropical Alphonso Mango Swirl',
                'type_key' => 'mango_pop',
                'points' => 1,
                'speed_multiplier' => 1.00,
                'spawn_weight' => 80,
                'image_path' => null,
                'primary_color' => '#FF9800',
                'secondary_color' => '#FFEB3B',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rainbow Twister',
                'flavor' => 'Lime, Strawberry & Pineapple',
                'type_key' => 'twister',
                'points' => 1,
                'speed_multiplier' => 1.10,
                'spawn_weight' => 70,
                'image_path' => null,
                'primary_color' => '#4CAF50',
                'secondary_color' => '#E91E63',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Wonder Cone',
                'flavor' => 'Vanilla Wafer Double Crunch',
                'type_key' => 'wonder_cone',
                'points' => 2,
                'speed_multiplier' => 1.15,
                'spawn_weight' => 45,
                'image_path' => null,
                'primary_color' => '#F06292',
                'secondary_color' => '#D7CCC8',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Golden Star',
                'flavor' => 'Elephant House Rare Gold Trophy',
                'type_key' => 'golden_star',
                'points' => 3,
                'speed_multiplier' => 1.25,
                'spawn_weight' => 20,
                'image_path' => null,
                'primary_color' => '#FFD700',
                'secondary_color' => '#FFFFFF',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('popsicles');
    }
};
