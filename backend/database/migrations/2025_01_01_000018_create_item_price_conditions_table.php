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
        Schema::create('item_price_conditions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 50)->unique();
            $table->foreignId('item_id')->nullable()->constrained('items')->nullOnDelete();
            $table->foreignId('item_category_id')->nullable()->constrained('item_categories')->nullOnDelete();
            $table->foreignId('item_sub_category_id')->nullable()->constrained('item_sub_categories')->nullOnDelete();
            $table->decimal('coverage_percentage', 5, 2)->default(0);
            $table->decimal('max_covered_amount', 15, 2)->nullable();
            $table->decimal('patient_share_percentage', 5, 2)->default(0);
            $table->decimal('fixed_patient_share', 15, 2)->nullable();
            $table->integer('max_quantity_per_prescription')->nullable();
            $table->integer('max_per_period')->nullable();
            $table->string('period_type', 20)->nullable()->comment('daily/weekly/monthly/yearly');
            $table->boolean('requires_pre_approval')->default(false);
            $table->integer('min_age')->nullable();
            $table->integer('max_age')->nullable();
            $table->string('gender', 10)->nullable()->comment('male/female/null=both');
            $table->string('relation_type', 50)->nullable()->comment('self/spouse/child/parent/null=all');
            $table->integer('waiting_days')->default(0);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('item_id');
            $table->index('item_category_id');
            $table->index('code');
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_price_conditions');
    }
};
