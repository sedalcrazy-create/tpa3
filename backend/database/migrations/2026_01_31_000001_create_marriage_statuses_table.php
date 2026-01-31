<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marriage_statuses', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('code', 20)->unique();
            $table->string('title', 100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default marriage statuses
        DB::table('marriage_statuses')->insert([
            ['id' => 1, 'code' => '1', 'title' => 'مجرد', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'code' => '2', 'title' => 'متاهل', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'code' => '3', 'title' => 'مطلقه', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'code' => '4', 'title' => 'همسر فوت شده', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marriage_statuses');
    }
};
