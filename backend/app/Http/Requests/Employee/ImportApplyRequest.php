<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class ImportApplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'import_mode' => ['required', 'in:insert_only,update_only,both'],
            'selected_fields' => ['nullable', 'array'],
            'selected_fields.*' => ['string'],
        ];
    }

    public function messages(): array
    {
        return [
            'import_mode.required' => 'حالت ورود الزامی است.',
            'import_mode.in' => 'حالت ورود باید یکی از insert_only, update_only, both باشد.',
        ];
    }
}
