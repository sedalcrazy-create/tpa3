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
        Schema::create('drug_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id_1')->constrained('items')->cascadeOnDelete();
            $table->foreignId('item_id_2')->constrained('items')->cascadeOnDelete();
            $table->string('severity', 20)->comment('mild/moderate/severe/contraindicated');
            $table->text('description')->nullable();
            $table->text('recommendation')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['item_id_1', 'item_id_2']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drug_interactions');
    }
};
