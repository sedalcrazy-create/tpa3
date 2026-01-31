<?php

namespace App\Enums;

enum ClaimType: string
{
    case Inpatient = 'inpatient';
    case Outpatient = 'outpatient';
    case Dental = 'dental';
    case Para = 'para';

    public function label(): string
    {
        return match ($this) {
            self::Inpatient => 'بستری',
            self::Outpatient => 'سرپایی',
            self::Dental => 'دندانپزشکی',
            self::Para => 'پاراکلینیکی',
        };
    }
}
