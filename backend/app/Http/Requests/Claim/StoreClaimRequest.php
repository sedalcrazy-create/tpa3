<?php

namespace App\Http\Requests\Claim;

use Illuminate\Foundation\Http\FormRequest;

class StoreClaimRequest extends FormRequest
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
            'invoice_id' => ['nullable', 'exists:invoices,id'],
            'claim_type' => ['required', 'in:inpatient,outpatient,dental,para'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'admission_date' => ['nullable', 'date'],
            'discharge_date' => ['nullable', 'date', 'after_or_equal:admission_date'],
            'admission_date_jalali' => ['nullable', 'string'],
            'discharge_date_jalali' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
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
            'employee_id.required' => 'انتخاب کارمند الزامی است.',
            'employee_id.exists' => 'کارمند انتخاب شده معتبر نیست.',
            'invoice_id.exists' => 'فاکتور انتخاب شده معتبر نیست.',
            'claim_type.required' => 'نوع پرونده الزامی است.',
            'claim_type.in' => 'نوع پرونده باید یکی از مقادیر بستری، سرپایی، دندانپزشکی یا پاراکلینیکی باشد.',
            'total_amount.numeric' => 'مبلغ کل باید عددی باشد.',
            'total_amount.min' => 'مبلغ کل نمی‌تواند منفی باشد.',
            'admission_date.date' => 'فرمت تاریخ پذیرش نامعتبر است.',
            'discharge_date.date' => 'فرمت تاریخ ترخیص نامعتبر است.',
            'discharge_date.after_or_equal' => 'تاریخ ترخیص باید بعد از تاریخ پذیرش یا برابر با آن باشد.',
            'admission_date_jalali.string' => 'تاریخ شمسی پذیرش باید متن باشد.',
            'discharge_date_jalali.string' => 'تاریخ شمسی ترخیص باید متن باشد.',
            'notes.string' => 'توضیحات باید متن باشد.',
        ];
    }
}
