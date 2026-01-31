<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class StoreInfractionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'infraction_type' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'infraction_date' => ['nullable', 'date'],
            'infraction_date_jalali' => ['nullable', 'string', 'max:10'],
            'penalty_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'infraction_type.required' => 'نوع تخلف الزامی است.',
        ];
    }
}
