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
        Schema::create('employee_import_history', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('file_name', 255);
            $table->string('file_path', 500)->nullable();
            $table->integer('total_rows')->default(0);
            $table->integer('success_count')->default(0);
            $table->integer('error_count')->default(0);
            $table->string('status', 20)->default('pending');
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_log')->nullable();
            $table->timestamps();
        });

        Schema::create('employees_import_temp', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('import_history_id')->constrained('employee_import_history')->cascadeOnDelete();
            $table->integer('row_number');
            $table->string('personnel_code', 20)->nullable();
            $table->string('national_code', 10)->nullable();
            $table->string('first_name', 255)->nullable();
            $table->string('last_name', 255)->nullable();
            $table->jsonb('raw_data')->nullable();
            $table->string('status', 20)->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees_import_temp');
        Schema::dropIfExists('employee_import_history');
    }
};
