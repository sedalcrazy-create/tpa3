<?php

namespace App\Http\Requests\Employee;

use App\Rules\NationalCode;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
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
        $employeeId = $this->route('employee');

        return [
            'personnel_code' => ['sometimes', 'nullable', 'string', 'max:20', 'unique:employees,personnel_code,' . $employeeId],
            'national_code' => ['sometimes', 'nullable', 'string', 'size:10', 'unique:employees,national_code,' . $employeeId, new NationalCode()],
            'first_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'father_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'gender' => ['sometimes', 'nullable', 'in:male,female'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'birth_date_jalali' => ['sometimes', 'nullable', 'string', 'max:10'],
            'id_number' => ['sometimes', 'nullable', 'string', 'max:20'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'mobile' => ['sometimes', 'nullable', 'string', 'max:15'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string'],
            'postal_code' => ['sometimes', 'nullable', 'string', 'max:10'],
            'province_id' => ['sometimes', 'nullable', 'exists:provinces,id'],
            'location_id' => ['sometimes', 'nullable', 'exists:locations,id'],
            'custom_employee_code_id' => ['sometimes', 'nullable', 'exists:custom_employee_codes,id'],
            'special_employee_type_id' => ['sometimes', 'nullable', 'exists:special_employee_types,id'],
            'relation_type_id' => ['sometimes', 'nullable', 'exists:relation_types,id'],
            'guardianship_type_id' => ['sometimes', 'nullable', 'exists:guardianship_types,id'],
            'parent_id' => ['sometimes', 'nullable', 'exists:employees,id'],
            'employment_date' => ['sometimes', 'nullable', 'date'],
            'employment_date_jalali' => ['sometimes', 'nullable', 'string', 'max:10'],
            'status' => ['sometimes', 'nullable', 'in:active,inactive,retired,deceased'],
            'bank_account_number' => ['sometimes', 'nullable', 'string', 'max:30'],
            'iban' => ['sometimes', 'nullable', 'string', 'max:30'],
            'is_head_of_family' => ['sometimes', 'nullable', 'boolean'],
            'priority' => ['sometimes', 'nullable', 'integer'],
            'description' => ['sometimes', 'nullable', 'string'],
            'photo' => ['sometimes', 'nullable', 'image', 'max:2048'],
            'marriage_status_id' => ['sometimes', 'nullable', 'exists:marriage_statuses,id'],
            'location_work_id' => ['sometimes', 'nullable', 'exists:locations,id'],
            'branch_id' => ['sometimes', 'nullable', 'integer'],
            'bazneshasegi_date' => ['sometimes', 'nullable', 'string', 'max:10'],
            'hoghogh_branch_id' => ['sometimes', 'nullable', 'integer'],
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
            'personnel_code.unique' => 'کد پرسنلی قبلاً ثبت شده است.',
            'personnel_code.max' => 'کد پرسنلی نباید بیشتر از ۲۰ کاراکتر باشد.',
            'national_code.size' => 'کد ملی باید ۱۰ رقم باشد.',
            'national_code.unique' => 'کد ملی قبلاً ثبت شده است.',
            'first_name.max' => 'نام نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'last_name.max' => 'نام خانوادگی نباید بیشتر از ۲۵۵ کاراکتر باشد.',
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
