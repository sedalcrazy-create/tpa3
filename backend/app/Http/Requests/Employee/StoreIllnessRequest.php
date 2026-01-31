<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class StoreIllnessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'illness_id' => ['required', 'exists:illnesses,id'],
            'diagnosed_date' => ['nullable', 'date'],
            'diagnosed_date_jalali' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'illness_id.required' => 'بیماری الزامی است.',
            'illness_id.exists' => 'بیماری انتخاب شده معتبر نیست.',
        ];
    }
}
