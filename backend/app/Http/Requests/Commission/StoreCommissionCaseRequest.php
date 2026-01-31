<?php

namespace App\Http\Requests\Commission;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommissionCaseRequest extends FormRequest
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
            'commission_case_type_id' => ['nullable', 'exists:commission_case_types,id'],
            'claim_id' => ['nullable', 'exists:claims,id'],
            'subject' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:users,id'],
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
            'employee_id.required' => 'کارمند الزامی است.',
            'employee_id.exists' => 'کارمند انتخاب شده معتبر نیست.',
            'commission_case_type_id.exists' => 'نوع پرونده کمیسیون معتبر نیست.',
            'claim_id.exists' => 'پرونده خسارت انتخاب شده معتبر نیست.',
            'subject.required' => 'موضوع الزامی است.',
            'subject.string' => 'موضوع باید متن باشد.',
            'subject.max' => 'موضوع نباید بیشتر از ۵۰۰ کاراکتر باشد.',
            'description.string' => 'توضیحات باید متن باشد.',
            'assigned_to.exists' => 'کاربر ارجاع شده معتبر نیست.',
        ];
    }
}
