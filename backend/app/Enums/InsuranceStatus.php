<?php

namespace App\Enums;

enum InsuranceStatus: string
{
    case Active = 'active';
    case Expired = 'expired';
    case Suspended = 'suspended';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'فعال',
            self::Expired => 'منقضی',
            self::Suspended => 'معلق',
            self::Cancelled => 'لغو شده',
        };
    }
}
