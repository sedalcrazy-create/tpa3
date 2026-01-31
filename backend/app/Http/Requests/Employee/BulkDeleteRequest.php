<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:employees,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'لیست شناسه‌ها الزامی است.',
            'ids.array' => 'شناسه‌ها باید به صورت آرایه ارسال شوند.',
            'ids.min' => 'حداقل یک شناسه باید ارسال شود.',
            'ids.*.exists' => 'یک یا چند شناسه معتبر نیست.',
        ];
    }
}
