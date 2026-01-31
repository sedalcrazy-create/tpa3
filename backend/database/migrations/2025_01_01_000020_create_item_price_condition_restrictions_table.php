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
        Schema::create('item_price_condition_restrictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_price_condition_id')->constrained('item_price_conditions')->cascadeOnDelete();
            $table->string('restriction_type', 50)->comment('max_per_body_part/conflict_item/required_diagnosis/max_total_usage');
            $table->jsonb('restriction_value')->comment('structured restriction data');
            $table->foreignId('conflict_item_id')->nullable()->constrained('items')->nullOnDelete();
            $table->unsignedBigInteger('body_part_type_id')->nullable()->comment('will FK later');
            $table->integer('max_count')->nullable();
            $table->string('period_type', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['item_price_condition_id', 'restriction_type'], 'ipcr_condition_restriction_type_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_price_condition_restrictions');
    }
};
