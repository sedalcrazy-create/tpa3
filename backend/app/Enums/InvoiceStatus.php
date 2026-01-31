<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case Draft = 'draft';
    case Calculated = 'calculated';
    case Submitted = 'submitted';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'پیش‌نویس',
            self::Calculated => 'محاسبه شده',
            self::Submitted => 'ارسال شده',
            self::Approved => 'تایید شده',
            self::Rejected => 'رد شده',
        };
    }
}
