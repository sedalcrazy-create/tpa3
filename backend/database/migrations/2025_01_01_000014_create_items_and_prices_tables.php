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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name', 500);
            $table->string('generic_name', 500)->nullable();
            $table->string('code', 50)->unique()->comment('کد دارو/خدمت');
            $table->foreignId('item_category_id')->nullable()->constrained('item_categories')->nullOnDelete();
            $table->foreignId('item_sub_category_id')->nullable()->constrained('item_sub_categories')->nullOnDelete();
            $table->foreignId('item_group_id')->nullable()->constrained('item_groups')->nullOnDelete();
            $table->string('item_type', 50)->comment('drug/service/consumable/device');
            $table->string('unit', 50)->nullable()->comment('عدد/بسته/etc');
            $table->string('dosage_form', 100)->nullable()->comment('قرص/آمپول/etc');
            $table->string('strength', 100)->nullable()->comment('dose strength');
            $table->string('manufacturer', 255)->nullable();
            $table->string('country', 100)->nullable();
            $table->boolean('is_otc')->default(false)->comment('over the counter');
            $table->boolean('is_covered')->default(true)->comment('تحت پوشش بیمه');
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index('name');
            $table->index('item_type');
            $table->index('item_category_id');
        });

        Schema::create('item_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->decimal('price', 15, 2)->comment('قیمت مصوب');
            $table->decimal('insurance_share_percentage', 5, 2)->default(0)->comment('درصد سهم بیمه');
            $table->decimal('patient_share_percentage', 5, 2)->default(0)->comment('درصد سهم بیمار');
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->string('price_type', 50)->default('approved')->comment('approved/free/contractual');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['item_id', 'effective_from']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_prices');
        Schema::dropIfExists('items');
    }
};
