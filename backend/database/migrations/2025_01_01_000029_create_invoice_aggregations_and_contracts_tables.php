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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number', 100)->unique();
            $table->string('title', 255);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('start_date_jalali', 10)->nullable();
            $table->string('end_date_jalali', 10)->nullable();
            $table->decimal('total_budget', 18, 2)->default(0);
            $table->decimal('used_budget', 18, 2)->default(0);
            $table->string('status', 20)->default('active')->comment('active/expired/suspended');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('invoice_aggregations', function (Blueprint $table) {
            $table->id();
            $table->string('aggregation_number', 50)->unique();
            $table->foreignId('center_id')->nullable()->constrained('centers')->nullOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('total_invoices')->default(0);
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->decimal('approved_amount', 18, 2)->default(0);
            $table->decimal('deduction_amount', 18, 2)->default(0);
            $table->decimal('paid_amount', 18, 2)->default(0);
            $table->string('status', 20)->default('pending')->comment('pending/approved/paid/rejected');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('center_id');
            $table->index('contract_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_aggregations');
        Schema::dropIfExists('contracts');
    }
};
