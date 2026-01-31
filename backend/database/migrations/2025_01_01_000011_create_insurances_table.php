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
        Schema::create('insurances', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('insurance_number', 50)->unique()->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('start_date_jalali', 10)->nullable();
            $table->string('end_date_jalali', 10)->nullable();
            $table->string('status', 20)->default('active');
            $table->decimal('basic_premium', 15, 2)->default(0);
            $table->decimal('supplementary_premium', 15, 2)->default(0);
            $table->decimal('annual_ceiling', 15, 2)->default(0);
            $table->decimal('used_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_id', 'status']);
        });

        Schema::create('insurance_histories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('insurance_id')->constrained('insurances')->cascadeOnDelete();
            $table->string('field_name', 100);
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insurance_histories');
        Schema::dropIfExists('insurances');
    }
};
