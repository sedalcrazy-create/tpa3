<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'invoice_items';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'invoice_id',
        'item_id',
        'item_price_id',
        'body_part_id',
        'quantity',
        'unit_price',
        'total_price',
        'insurance_share',
        'patient_share',
        'coverage_percentage',
        'discount_amount',
        'deduction_amount',
        'deduction_reason',
        'is_covered',
        'is_approved',
        'rejection_reason',
        'applied_condition_id',
        'pricing_details',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
            'insurance_share' => 'decimal:2',
            'patient_share' => 'decimal:2',
            'coverage_percentage' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'deduction_amount' => 'decimal:2',
            'is_covered' => 'boolean',
            'is_approved' => 'boolean',
            'pricing_details' => 'array',
        ];
    }

    /**
     * The invoice that this item belongs to.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * The item that this invoice item belongs to.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * The item price that this invoice item belongs to.
     */
    public function itemPrice(): BelongsTo
    {
        return $this->belongsTo(ItemPrice::class, 'item_price_id');
    }

    /**
     * The body part that this invoice item belongs to.
     */
    public function bodyPart(): BelongsTo
    {
        return $this->belongsTo(BodyPart::class);
    }

    /**
     * The applied condition for this invoice item.
     */
    public function appliedCondition(): BelongsTo
    {
        return $this->belongsTo(ItemPriceCondition::class, 'applied_condition_id');
    }
}
