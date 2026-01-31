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
        Schema::table('employees_import_temp', function (Blueprint $table) {
            $table->string('new_p_code', 20)->nullable()->after('last_name');
            $table->string('action', 20)->default('pending')->after('new_p_code');
            $table->unsignedBigInteger('matched_employee_id')->nullable()->after('action');
            $table->json('diff_data')->nullable()->after('matched_employee_id');
        });

        Schema::table('employee_import_history', function (Blueprint $table) {
            $table->string('import_mode', 20)->default('both')->after('error_log');
            $table->json('selected_fields')->nullable()->after('import_mode');
            $table->integer('insert_count')->default(0)->after('selected_fields');
            $table->integer('update_count')->default(0)->after('insert_count');
            $table->integer('skip_count')->default(0)->after('update_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees_import_temp', function (Blueprint $table) {
            $table->dropColumn(['new_p_code', 'action', 'matched_employee_id', 'diff_data']);
        });

        Schema::table('employee_import_history', function (Blueprint $table) {
            $table->dropColumn(['import_mode', 'selected_fields', 'insert_count', 'update_count', 'skip_count']);
        });
    }
};
