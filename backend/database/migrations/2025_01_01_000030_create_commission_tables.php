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
        Schema::create('commission_case_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('verdict_templates', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('content');
            $table->foreignId('commission_case_type_id')->nullable()->constrained('commission_case_types')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('commission_cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_number', 50)->unique();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('commission_case_type_id')->nullable()->constrained('commission_case_types')->nullOnDelete();
            $table->foreignId('claim_id')->nullable()->constrained('claims')->nullOnDelete();
            $table->string('subject', 500);
            $table->text('description')->nullable();
            $table->string('status', 20)->default('pending')->comment('pending/in_review/verdict_issued/closed');
            $table->text('verdict')->nullable();
            $table->foreignId('verdict_template_id')->nullable()->constrained('verdict_templates')->nullOnDelete();
            $table->date('verdict_date')->nullable();
            $table->string('verdict_date_jalali', 10)->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('social_work_cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_number', 50)->unique();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('subject', 500);
            $table->text('description')->nullable();
            $table->string('status', 20)->default('open')->comment('open/in_progress/resolved/closed');
            $table->text('resolution')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_work_cases');
        Schema::dropIfExists('commission_cases');
        Schema::dropIfExists('verdict_templates');
        Schema::dropIfExists('commission_case_types');
    }
};
