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
        Schema::create('centers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 500);
            $table->string('code', 50)->unique();
            $table->string('center_type', 50)->comment('hospital/clinic/pharmacy/lab/imaging/dentistry/physiotherapy');
            $table->foreignId('province_id')->nullable()->constrained('provinces')->nullOnDelete();
            $table->string('city', 255)->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('fax', 20)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('license_number', 100)->nullable();
            $table->boolean('is_contracted')->default(false)->comment('طرف قرارداد');
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index('center_type');
            $table->index('province_id');
        });

        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 255);
            $table->string('last_name', 255);
            $table->string('national_code', 10)->nullable()->unique();
            $table->string('medical_council_code', 20)->nullable()->unique()->comment('کد نظام پزشکی');
            $table->string('specialty', 255)->nullable();
            $table->string('sub_specialty', 255)->nullable();
            $table->string('phone', 20)->nullable();
            $table->foreignId('center_id')->nullable()->constrained('centers')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('institution_contract_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('institution_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('center_id')->constrained('centers')->cascadeOnDelete();
            $table->foreignId('institution_contract_type_id')->constrained('institution_contract_types');
            $table->string('contract_number', 100)->nullable()->unique();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('max_amount', 15, 2)->nullable();
            $table->text('terms')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institution_contracts');
        Schema::dropIfExists('institution_contract_types');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('centers');
    }
};
