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
        Schema::create('illnesses', function (Blueprint $table) {
            $table->id();
            $table->string('icd_code', 20)->unique()->comment('ICD-10 code');
            $table->string('name', 500)->comment('Persian name');
            $table->string('name_en', 500)->nullable()->comment('English name');
            $table->string('category', 100)->nullable()->comment('ICD category');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->boolean('is_chronic')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('illnesses')->nullOnDelete();

            $table->index('icd_code');
            $table->index('name');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('illnesses');
    }
};
