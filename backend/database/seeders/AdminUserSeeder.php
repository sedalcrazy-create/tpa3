<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $adminRole = DB::table('roles')->where('name', 'admin')->first();

        DB::table('users')->insert([
            'name' => 'مدیر سیستم',
            'email' => 'admin@tpa.ir',
            'password' => Hash::make('Admin@123'),
            'role_id' => $adminRole->id,
            'national_code' => '0000000000',
            'is_active' => true,
            'email_verified_at' => $now,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
