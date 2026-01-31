<?php

namespace App\Http\Requests\Prescription;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'exists:employees,id'],
            'doctor_id' => ['nullable', 'exists:doctors,id'],
            'center_id' => ['nullable', 'exists:centers,id'],
            'prescription_type_id' => ['nullable', 'exists:prescription_types,id'],
            'prescription_date' => ['required', 'date'],
            'prescription_date_jalali' => ['nullable', 'string', 'max:10'],
            'diagnosis_code' => ['nullable', 'string', 'max:20'],
            'illness_id' => ['nullable', 'exists:illnesses,id'],
            'notes' => ['nullable', 'string'],
            'is_emergency' => ['nullable', 'boolean'],
            'is_chronic' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'انتخاب بیمه‌شده الزامی است.',
            'employee_id.exists' => 'بیمه‌شده انتخاب شده معتبر نیست.',
            'doctor_id.exists' => 'پزشک انتخاب شده معتبر نیست.',
            'center_id.exists' => 'مرکز درمانی انتخاب شده معتبر نیست.',
            'prescription_type_id.exists' => 'نوع نسخه انتخاب شده معتبر نیست.',
            'prescription_date.required' => 'تاریخ نسخه الزامی است.',
            'prescription_date.date' => 'فرمت تاریخ نسخه نامعتبر است.',
            'prescription_date_jalali.string' => 'تاریخ شمسی نسخه باید متن باشد.',
            'prescription_date_jalali.max' => 'تاریخ شمسی نسخه نباید بیشتر از ۱۰ کاراکتر باشد.',
            'diagnosis_code.string' => 'کد تشخیص باید متن باشد.',
            'diagnosis_code.max' => 'کد تشخیص نباید بیشتر از ۲۰ کاراکتر باشد.',
            'illness_id.exists' => 'بیماری انتخاب شده معتبر نیست.',
            'notes.string' => 'توضیحات باید متن باشد.',
            'is_emergency.boolean' => 'فیلد اورژانسی باید صحیح یا غلط باشد.',
            'is_chronic.boolean' => 'فیلد مزمن باید صحیح یا غلط باشد.',
        ];
    }
}
