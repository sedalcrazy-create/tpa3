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
        Schema::create('body_part_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->comment('e.g. دندان، چشم، مفصل');
            $table->string('code', 50)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('body_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('body_part_type_id')->constrained('body_part_types')->cascadeOnDelete();
            $table->string('name', 255)->comment('e.g. دندان شماره ۱');
            $table->string('code', 50)->unique();
            $table->string('position', 50)->nullable()->comment('left/right/upper/lower/etc');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('body_parts');
        Schema::dropIfExists('body_part_types');
    }
};
