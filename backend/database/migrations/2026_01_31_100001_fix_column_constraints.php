<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix status column length: "completed_with_errors" is 22 chars
        Schema::table('employee_import_history', function (Blueprint $table) {
            $table->string('status', 30)->default('pending')->change();
        });

        Schema::table('employees_import_temp', function (Blueprint $table) {
            $table->string('status', 30)->default('pending')->change();
        });

        // Allow null national_code: many HR records have no national code
        Schema::table('employees', function (Blueprint $table) {
            $table->string('national_code', 10)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('employee_import_history', function (Blueprint $table) {
            $table->string('status', 20)->default('pending')->change();
        });

        Schema::table('employees_import_temp', function (Blueprint $table) {
            $table->string('status', 20)->default('pending')->change();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('national_code', 10)->nullable(false)->change();
        });
    }
};
