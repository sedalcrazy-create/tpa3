<?php

namespace App\Http\Requests\Employee;

use App\Rules\NationalCode;
use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
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
            'personnel_code' => ['required', 'string', 'max:20', 'unique:employees,personnel_code'],
            'national_code' => ['required', 'string', 'size:10', 'unique:employees,national_code', new NationalCode()],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['nullable', 'date'],
            'birth_date_jalali' => ['nullable', 'string', 'max:10'],
            'id_number' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:20'],
            'mobile' => ['nullable', 'string', 'max:15'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'custom_employee_code_id' => ['nullable', 'exists:custom_employee_codes,id'],
            'special_employee_type_id' => ['nullable', 'exists:special_employee_types,id'],
            'relation_type_id' => ['nullable', 'exists:relation_types,id'],
            'guardianship_type_id' => ['nullable', 'exists:guardianship_types,id'],
            'parent_id' => ['nullable', 'exists:employees,id'],
            'employment_date' => ['nullable', 'date'],
            'employment_date_jalali' => ['nullable', 'string', 'max:10'],
            'status' => ['nullable', 'in:active,inactive,retired,deceased'],
            'bank_account_number' => ['nullable', 'string', 'max:30'],
            'iban' => ['nullable', 'string', 'max:30'],
            'is_head_of_family' => ['nullable', 'boolean'],
            'priority' => ['nullable', 'integer'],
            'description' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'marriage_status_id' => ['nullable', 'exists:marriage_statuses,id'],
            'location_work_id' => ['nullable', 'exists:locations,id'],
            'branch_id' => ['nullable', 'integer'],
            'bazneshasegi_date' => ['nullable', 'string', 'max:10'],
            'hoghogh_branch_id' => ['nullable', 'integer'],
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
            'personnel_code.required' => 'کد پرسنلی الزامی است.',
            'personnel_code.unique' => 'کد پرسنلی قبلاً ثبت شده است.',
            'personnel_code.max' => 'کد پرسنلی نباید بیشتر از ۲۰ کاراکتر باشد.',
            'national_code.required' => 'کد ملی الزامی است.',
            'national_code.size' => 'کد ملی باید ۱۰ رقم باشد.',
            'national_code.unique' => 'کد ملی قبلاً ثبت شده است.',
            'first_name.required' => 'نام الزامی است.',
            'first_name.max' => 'نام نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'last_name.required' => 'نام خانوادگی الزامی است.',
            'last_name.max' => 'نام خانوادگی نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'gender.required' => 'جنسیت الزامی است.',
            'gender.in' => 'جنسیت باید مرد یا زن باشد.',
            'birth_date.date' => 'فرمت تاریخ تولد نامعتبر است.',
            'email.email' => 'فرمت ایمیل نامعتبر است.',
            'province_id.exists' => 'استان انتخاب شده معتبر نیست.',
            'location_id.exists' => 'محل خدمت انتخاب شده معتبر نیست.',
            'custom_employee_code_id.exists' => 'کد کارمندی سفارشی معتبر نیست.',
            'special_employee_type_id.exists' => 'نوع کارمند ویژه معتبر نیست.',
            'relation_type_id.exists' => 'نوع نسبت معتبر نیست.',
            'guardianship_type_id.exists' => 'نوع قیمومیت معتبر نیست.',
            'parent_id.exists' => 'سرپرست انتخاب شده معتبر نیست.',
            'status.in' => 'وضعیت انتخاب شده معتبر نیست.',
        ];
    }
}
