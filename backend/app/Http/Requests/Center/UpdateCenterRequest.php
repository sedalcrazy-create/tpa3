<?php

namespace App\Http\Requests\Center;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCenterRequest extends FormRequest
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
        $centerId = $this->route('center');

        return [
            'name' => ['sometimes', 'string', 'max:500'],
            'code' => ['sometimes', 'string', 'max:50', 'unique:centers,code,' . $centerId],
            'center_type' => ['sometimes', 'in:hospital,clinic,pharmacy,lab,imaging,dentistry,physiotherapy'],
            'province_id' => ['sometimes', 'nullable', 'exists:provinces,id'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'fax' => ['sometimes', 'nullable', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'email'],
            'license_number' => ['sometimes', 'nullable', 'string', 'max:100'],
            'is_contracted' => ['sometimes', 'nullable', 'boolean'],
            'contract_start_date' => ['sometimes', 'nullable', 'date'],
            'contract_end_date' => ['sometimes', 'nullable', 'date'],
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
            'name.string' => 'نام مرکز باید متن باشد.',
            'name.max' => 'نام مرکز نباید بیشتر از ۵۰۰ کاراکتر باشد.',
            'code.string' => 'کد مرکز باید متن باشد.',
            'code.max' => 'کد مرکز نباید بیشتر از ۵۰ کاراکتر باشد.',
            'code.unique' => 'کد مرکز قبلاً ثبت شده است.',
            'center_type.in' => 'نوع مرکز انتخاب شده معتبر نیست.',
            'province_id.exists' => 'استان انتخاب شده معتبر نیست.',
            'city.string' => 'شهر باید متن باشد.',
            'city.max' => 'شهر نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'address.string' => 'آدرس باید متن باشد.',
            'phone.string' => 'تلفن باید متن باشد.',
            'phone.max' => 'تلفن نباید بیشتر از ۲۰ کاراکتر باشد.',
            'fax.string' => 'فکس باید متن باشد.',
            'fax.max' => 'فکس نباید بیشتر از ۲۰ کاراکتر باشد.',
            'email.email' => 'فرمت ایمیل نامعتبر است.',
            'license_number.string' => 'شماره مجوز باید متن باشد.',
            'license_number.max' => 'شماره مجوز نباید بیشتر از ۱۰۰ کاراکتر باشد.',
            'is_contracted.boolean' => 'وضعیت قرارداد باید صحیح یا غلط باشد.',
            'contract_start_date.date' => 'فرمت تاریخ شروع قرارداد نامعتبر است.',
            'contract_end_date.date' => 'فرمت تاریخ پایان قرارداد نامعتبر است.',
        ];
    }
}
