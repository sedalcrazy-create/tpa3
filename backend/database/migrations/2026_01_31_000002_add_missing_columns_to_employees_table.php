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
        Schema::table('employees', function (Blueprint $table) {
            $table->integer('priority')->nullable()->after('is_active');
            $table->text('description')->nullable()->after('priority');
            $table->string('photo', 500)->nullable()->after('description');
            $table->foreignId('marriage_status_id')->nullable()->after('photo')
                ->constrained('marriage_statuses')->nullOnDelete();
            $table->foreignId('location_work_id')->nullable()->after('marriage_status_id')
                ->constrained('locations')->nullOnDelete();
            $table->unsignedBigInteger('branch_id')->nullable()->after('location_work_id');
            $table->string('bazneshasegi_date', 10)->nullable()->after('branch_id');
            $table->unsignedBigInteger('hoghogh_branch_id')->nullable()->after('bazneshasegi_date');

            $table->index('marriage_status_id');
            $table->index('location_work_id');
            $table->index('branch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['marriage_status_id']);
            $table->dropForeign(['location_work_id']);
            $table->dropIndex(['marriage_status_id']);
            $table->dropIndex(['location_work_id']);
            $table->dropIndex(['branch_id']);
            $table->dropColumn([
                'priority',
                'description',
                'photo',
                'marriage_status_id',
                'location_work_id',
                'branch_id',
                'bazneshasegi_date',
                'hoghogh_branch_id',
            ]);
        });
    }
};
