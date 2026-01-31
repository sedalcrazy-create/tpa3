<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class StoreFamilyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'personnel_code' => ['required', 'string', 'max:20'],
            'national_code' => ['required', 'string', 'size:10'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['nullable', 'date'],
            'birth_date_jalali' => ['nullable', 'string', 'max:10'],
            'relation_type_id' => ['nullable', 'exists:relation_types,id'],
            'guardianship_type_id' => ['nullable', 'exists:guardianship_types,id'],
            'is_active' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:active,inactive,retired,deceased'],
        ];
    }

    public function messages(): array
    {
        return [
            'personnel_code.required' => 'کد پرسنلی الزامی است.',
            'national_code.required' => 'کد ملی الزامی است.',
            'national_code.size' => 'کد ملی باید ۱۰ رقم باشد.',
            'first_name.required' => 'نام الزامی است.',
            'last_name.required' => 'نام خانوادگی الزامی است.',
            'gender.required' => 'جنسیت الزامی است.',
        ];
    }
}
