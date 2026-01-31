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
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_number', 50)->unique()->comment('شماره پرونده');
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->string('claim_type', 50)->comment('inpatient/outpatient/dental/para');
            $table->smallInteger('status')->default(2)->comment('ClaimStatus enum values (1-8)');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('approved_amount', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('deduction_amount', 15, 2)->default(0);
            $table->date('admission_date')->nullable()->comment('تاریخ بستری');
            $table->date('discharge_date')->nullable()->comment('تاریخ ترخیص');
            $table->string('admission_date_jalali', 10)->nullable();
            $table->string('discharge_date_jalali', 10)->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('settled_at')->nullable();
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('claim_number');
            $table->index('employee_id');
            $table->index('status');
            $table->index('claim_type');
            $table->index('invoice_id');
        });

        Schema::create('claim_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained('claims')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->text('note');
            $table->string('note_type', 50)->default('general')->comment('general/rejection/approval/return');
            $table->boolean('is_internal')->default(false)->comment('internal notes not shown to claimant');
            $table->timestamps();
        });

        Schema::create('claim_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained('claims')->cascadeOnDelete();
            $table->foreignId('document_type_id')->nullable()->constrained('document_types')->nullOnDelete();
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->integer('file_size')->nullable()->comment('in KB');
            $table->string('mime_type', 100)->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claim_attachments');
        Schema::dropIfExists('claim_notes');
        Schema::dropIfExists('claims');
    }
};
