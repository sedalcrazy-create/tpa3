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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 50)->unique();
            $table->foreignId('prescription_id')->nullable()->constrained('prescriptions')->nullOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('center_id')->nullable()->constrained('centers')->nullOnDelete();
            $table->date('invoice_date');
            $table->string('invoice_date_jalali', 10)->nullable();
            $table->decimal('total_amount', 15, 2)->default(0)->comment('مبلغ کل');
            $table->decimal('insurance_share', 15, 2)->default(0)->comment('سهم بیمه');
            $table->decimal('patient_share', 15, 2)->default(0)->comment('سهم بیمار');
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('deduction_amount', 15, 2)->default(0)->comment('کسورات');
            $table->decimal('paid_amount', 15, 2)->default(0)->comment('مبلغ پرداختی');
            $table->string('status', 20)->default('draft')->comment('draft/calculated/submitted/approved/rejected');
            $table->timestamp('calculated_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('invoice_number');
            $table->index('employee_id');
            $table->index('center_id');
            $table->index('status');
            $table->index('invoice_date');
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items');
            $table->foreignId('item_price_id')->nullable()->constrained('item_prices')->nullOnDelete();
            $table->foreignId('body_part_id')->nullable()->constrained('body_parts')->nullOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 15, 2)->default(0)->comment('قیمت واحد');
            $table->decimal('total_price', 15, 2)->default(0)->comment('قیمت کل');
            $table->decimal('insurance_share', 15, 2)->default(0);
            $table->decimal('patient_share', 15, 2)->default(0);
            $table->decimal('coverage_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('deduction_amount', 15, 2)->default(0);
            $table->text('deduction_reason')->nullable();
            $table->boolean('is_covered')->default(true);
            $table->boolean('is_approved')->default(true);
            $table->text('rejection_reason')->nullable();
            $table->foreignId('applied_condition_id')->nullable()->constrained('item_price_conditions')->nullOnDelete()->comment('which pricing rule was applied');
            $table->jsonb('pricing_details')->nullable()->comment('full pricing calculation details');
            $table->timestamps();

            $table->index(['invoice_id', 'item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
    }
};
