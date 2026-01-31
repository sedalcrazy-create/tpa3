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
        Schema::create('item_price_condition_filters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_price_condition_id')->constrained('item_price_conditions')->cascadeOnDelete();
            $table->string('filter_type', 50)->comment('province/location/employee_code/special_type/illness');
            $table->string('filter_operator', 20)->comment('in/not_in/equals/not_equals');
            $table->jsonb('filter_value')->comment('array of values');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['item_price_condition_id', 'filter_type'], 'ipcf_condition_filter_type_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_price_condition_filters');
    }
};
