<?php

namespace App\Enums;

enum EmployeeStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Retired = 'retired';
    case Deceased = 'deceased';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'فعال',
            self::Inactive => 'غیرفعال',
            self::Retired => 'بازنشسته',
            self::Deceased => 'متوفی',
        };
    }
}
