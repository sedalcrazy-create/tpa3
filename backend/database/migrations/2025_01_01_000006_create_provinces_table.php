<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 10)->unique()->comment('کد استان');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Add foreign key for locations.province_id -> provinces.id
        Schema::table('locations', function (Blueprint $table) {
            $table->foreign('province_id')
                  ->references('id')
                  ->on('provinces')
                  ->onDelete('set null')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key before dropping provinces table
        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['province_id']);
        });

        Schema::dropIfExists('provinces');
    }
};
