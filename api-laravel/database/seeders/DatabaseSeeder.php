<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
{
    $demo = User::factory()->create([
        'name' => 'Demo User',
        'email' => 'demo@demo.com',
        'password' => Hash::make('password'),
    ]);
    Post::factory()->count(3)->create(['user_id' => $demo->id]);

    User::factory()->count(10)->create()->each(function ($u) {
        Post::factory()->count(rand(1,4))->create(['user_id' => $u->id]);
    });
}
}
