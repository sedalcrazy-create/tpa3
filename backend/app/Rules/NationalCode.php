<?php

namespace App\Rules;

use App\Helpers\NationalCodeValidator;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NationalCode implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!NationalCodeValidator::validate((string) $value)) {
            $fail('کد ملی وارد شده معتبر نیست.');
        }
    }
}
