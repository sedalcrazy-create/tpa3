<?php

namespace App\Http\Requests\Contract;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $contractId = $this->route('contract');

        return [
            'contract_number' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('contracts', 'contract_number')->ignore($contractId),
            ],
            'title' => ['sometimes', 'string', 'max:255'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'total_budget' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:active,expired,suspended'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'contract_number.string' => 'شماره قرارداد باید رشته باشد.',
            'contract_number.max' => 'شماره قرارداد نباید بیشتر از ۱۰۰ کاراکتر باشد.',
            'contract_number.unique' => 'شماره قرارداد قبلاً ثبت شده است.',
            'title.string' => 'عنوان قرارداد باید رشته باشد.',
            'title.max' => 'عنوان قرارداد نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'start_date.date' => 'فرمت تاریخ شروع نامعتبر است.',
            'end_date.date' => 'فرمت تاریخ پایان نامعتبر است.',
            'end_date.after' => 'تاریخ پایان باید بعد از تاریخ شروع باشد.',
            'total_budget.numeric' => 'بودجه کل باید عددی باشد.',
            'total_budget.min' => 'بودجه کل نمی‌تواند منفی باشد.',
            'status.in' => 'وضعیت انتخاب شده نامعتبر است.',
            'description.string' => 'توضیحات باید رشته باشد.',
        ];
    }
}
