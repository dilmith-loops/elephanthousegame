<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Score;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Admin
        Admin::updateOrCreate(
            ['email' => 'admin@elephanthouse.lk'],
            [
                'name' => 'Elephant House Admin',
                'password' => Hash::make('admin123'),
            ]
        );

        // 2. Create Sample Players
        $players = [
            ['name' => 'Kasun Perera', 'mobile' => '0771234567', 'email' => 'kasun@gmail.com'],
            ['name' => 'Dilini Fernando', 'mobile' => '0719876543', 'email' => 'dilini@gmail.com'],
            ['name' => 'Nimal Jayasuriya', 'mobile' => '0765554321', 'email' => 'nimal@yahoo.com'],
            ['name' => 'Sanduni Silva', 'mobile' => '0783332211', 'email' => 'sanduni@outlook.com'],
        ];

        foreach ($players as $p) {
            $user = User::updateOrCreate(
                ['mobile' => $p['mobile']],
                $p
            );

            // Seed scores
            Score::create([
                'user_id' => $user->id,
                'score' => rand(15, 45),
                'popsicles_caught' => rand(12, 35),
                'duration_seconds' => rand(30, 75),
            ]);
        }
    }
}
