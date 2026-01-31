<?php

namespace App\Http\Requests\Center;

use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'national_code' => ['nullable', 'string', 'size:10', 'unique:doctors,national_code'],
            'medical_council_code' => ['nullable', 'string', 'max:20', 'unique:doctors,medical_council_code'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'sub_specialty' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'center_id' => ['nullable', 'exists:centers,id'],
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
            'first_name.required' => 'نام پزشک الزامی است.',
            'first_name.string' => 'نام پزشک باید متن باشد.',
            'first_name.max' => 'نام پزشک نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'last_name.required' => 'نام خانوادگی پزشک الزامی است.',
            'last_name.string' => 'نام خانوادگی پزشک باید متن باشد.',
            'last_name.max' => 'نام خانوادگی پزشک نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'national_code.string' => 'کد ملی باید متن باشد.',
            'national_code.size' => 'کد ملی باید ۱۰ رقم باشد.',
            'national_code.unique' => 'کد ملی قبلاً ثبت شده است.',
            'medical_council_code.string' => 'کد نظام پزشکی باید متن باشد.',
            'medical_council_code.max' => 'کد نظام پزشکی نباید بیشتر از ۲۰ کاراکتر باشد.',
            'medical_council_code.unique' => 'کد نظام پزشکی قبلاً ثبت شده است.',
            'specialty.string' => 'تخصص باید متن باشد.',
            'specialty.max' => 'تخصص نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'sub_specialty.string' => 'فوق تخصص باید متن باشد.',
            'sub_specialty.max' => 'فوق تخصص نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'phone.string' => 'تلفن باید متن باشد.',
            'phone.max' => 'تلفن نباید بیشتر از ۲۰ کاراکتر باشد.',
            'center_id.exists' => 'مرکز انتخاب شده معتبر نیست.',
        ];
    }
}
