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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->string('prescription_number', 50)->unique();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained('doctors')->nullOnDelete();
            $table->foreignId('center_id')->nullable()->constrained('centers')->nullOnDelete();
            $table->foreignId('prescription_type_id')->nullable()->constrained('prescription_types')->nullOnDelete();
            $table->date('prescription_date');
            $table->string('prescription_date_jalali', 10)->nullable();
            $table->string('diagnosis_code', 20)->nullable()->comment('ICD code');
            $table->foreignId('illness_id')->nullable()->constrained('illnesses')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->boolean('is_emergency')->default(false);
            $table->boolean('is_chronic')->default(false);
            $table->string('status', 20)->default('active')->comment('active/used/cancelled');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('prescription_number');
            $table->index('employee_id');
            $table->index('doctor_id');
            $table->index('prescription_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
