<?php

namespace App\Http\Requests\Insurance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInsuranceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $insuranceId = $this->route('insurance');

        return [
            'employee_id' => ['sometimes', 'exists:employees,id'],
            'insurance_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('insurances', 'insurance_number')->ignore($insuranceId),
            ],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'start_date_jalali' => ['nullable', 'string'],
            'end_date_jalali' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,expired,suspended,cancelled'],
            'basic_premium' => ['nullable', 'numeric', 'min:0'],
            'supplementary_premium' => ['nullable', 'numeric', 'min:0'],
            'annual_ceiling' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.exists' => 'کارمند انتخاب شده معتبر نیست.',
            'insurance_number.string' => 'شماره بیمه باید رشته باشد.',
            'insurance_number.max' => 'شماره بیمه نباید بیشتر از ۵۰ کاراکتر باشد.',
            'insurance_number.unique' => 'شماره بیمه قبلاً ثبت شده است.',
            'start_date.date' => 'فرمت تاریخ شروع نامعتبر است.',
            'end_date.date' => 'فرمت تاریخ پایان نامعتبر است.',
            'end_date.after' => 'تاریخ پایان باید بعد از تاریخ شروع باشد.',
            'start_date_jalali.string' => 'تاریخ شمسی شروع باید رشته باشد.',
            'end_date_jalali.string' => 'تاریخ شمسی پایان باید رشته باشد.',
            'status.in' => 'وضعیت انتخاب شده نامعتبر است.',
            'basic_premium.numeric' => 'حق بیمه پایه باید عددی باشد.',
            'basic_premium.min' => 'حق بیمه پایه نمی‌تواند منفی باشد.',
            'supplementary_premium.numeric' => 'حق بیمه تکمیلی باید عددی باشد.',
            'supplementary_premium.min' => 'حق بیمه تکمیلی نمی‌تواند منفی باشد.',
            'annual_ceiling.numeric' => 'سقف سالانه باید عددی باشد.',
            'annual_ceiling.min' => 'سقف سالانه نمی‌تواند منفی باشد.',
        ];
    }
}
