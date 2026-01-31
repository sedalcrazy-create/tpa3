<?php

namespace App\Helpers;

use Morilog\Jalali\Jalalian;

class JalaliHelper
{
    public static function toJalali(?string $date, string $format = 'Y/m/d'): ?string
    {
        if (!$date) {
            return null;
        }

        return Jalalian::fromDateTime($date)->format($format);
    }

    public static function toGregorian(string $jalaliDate): ?string
    {
        if (!$jalaliDate) {
            return null;
        }

        $parts = preg_split('/[\/\-]/', $jalaliDate);
        if (count($parts) !== 3) {
            return null;
        }

        return Jalalian::fromFormat('Y/m/d', implode('/', $parts))
            ->toCarbon()
            ->format('Y-m-d');
    }

    public static function now(string $format = 'Y/m/d'): string
    {
        return Jalalian::now()->format($format);
    }
}
