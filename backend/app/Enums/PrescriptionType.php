<?php

namespace App\Enums;

enum PrescriptionType: string
{
    case Normal = 'normal';
    case Emergency = 'emergency';
    case Chronic = 'chronic';

    public function label(): string
    {
        return match ($this) {
            self::Normal => 'عادی',
            self::Emergency => 'اورژانسی',
            self::Chronic => 'مزمن',
        };
    }
}
