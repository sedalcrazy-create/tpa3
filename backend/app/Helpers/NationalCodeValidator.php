<?php

namespace App\Helpers;

class NationalCodeValidator
{
    /**
     * Validate Iranian national code (کد ملی).
     */
    public static function validate(string $code): bool
    {
        // Must be exactly 10 digits
        if (!preg_match('/^\d{10}$/', $code)) {
            return false;
        }

        // Reject all-same digits
        if (preg_match('/^(\d)\1{9}$/', $code)) {
            return false;
        }

        $check = (int) $code[9];
        $sum = 0;

        for ($i = 0; $i < 9; $i++) {
            $sum += (int) $code[$i] * (10 - $i);
        }

        $remainder = $sum % 11;

        if ($remainder < 2) {
            return $check === $remainder;
        }

        return $check === (11 - $remainder);
    }
}
