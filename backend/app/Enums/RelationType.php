<?php

namespace App\Enums;

enum RelationType: string
{
    case Self = 'self';
    case Spouse = 'spouse';
    case Child = 'child';
    case Parent = 'parent';

    public function label(): string
    {
        return match ($this) {
            self::Self => 'خود بیمه‌شده',
            self::Spouse => 'همسر',
            self::Child => 'فرزند',
            self::Parent => 'والدین',
        };
    }
}
