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
        Schema::create('employees', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('personnel_code', 20)->unique();
            $table->string('national_code', 10)->unique();
            $table->string('first_name', 255);
            $table->string('last_name', 255);
            $table->string('father_name', 255)->nullable();
            $table->string('gender', 10);
            $table->date('birth_date')->nullable();
            $table->string('birth_date_jalali', 10)->nullable();
            $table->string('id_number', 20)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('mobile', 15)->nullable();
            $table->string('email', 255)->nullable();
            $table->text('address')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->foreignId('province_id')->nullable()->constrained('provinces')->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('custom_employee_code_id')->nullable()->constrained('custom_employee_codes')->nullOnDelete();
            $table->foreignId('special_employee_type_id')->nullable()->constrained('special_employee_types')->nullOnDelete();
            $table->foreignId('relation_type_id')->nullable()->constrained('relation_types')->nullOnDelete();
            $table->foreignId('guardianship_type_id')->nullable()->constrained('guardianship_types')->nullOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('employees')->nullOnDelete();
            $table->date('employment_date')->nullable();
            $table->string('employment_date_jalali', 10)->nullable();
            $table->date('retirement_date')->nullable();
            $table->string('status', 20)->default('active');
            $table->string('bank_account_number', 30)->nullable();
            $table->string('iban', 30)->nullable();
            $table->boolean('is_head_of_family')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('national_code');
            $table->index('personnel_code');
            $table->index('last_name');
            $table->index('status');
            $table->index('parent_id');
            $table->index('location_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
