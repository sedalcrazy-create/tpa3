<?php

namespace App\Http\Requests\Invoice;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
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
            'prescription_id' => ['nullable', 'exists:prescriptions,id'],
            'employee_id' => ['required', 'exists:employees,id'],
            'center_id' => ['nullable', 'exists:centers,id'],
            'invoice_date' => ['required', 'date'],
            'invoice_date_jalali' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.body_part_id' => ['nullable', 'exists:body_parts,id'],
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
            'prescription_id.exists' => 'نسخه انتخاب شده معتبر نیست.',
            'employee_id.required' => 'انتخاب بیمه‌شده الزامی است.',
            'employee_id.exists' => 'بیمه‌شده انتخاب شده معتبر نیست.',
            'center_id.exists' => 'مرکز درمانی انتخاب شده معتبر نیست.',
            'invoice_date.required' => 'تاریخ صورتحساب الزامی است.',
            'invoice_date.date' => 'فرمت تاریخ صورتحساب نامعتبر است.',
            'invoice_date_jalali.string' => 'تاریخ شمسی صورتحساب باید متن باشد.',
            'notes.string' => 'توضیحات باید متن باشد.',
            'items.required' => 'حداقل یک آیتم الزامی است.',
            'items.array' => 'آیتم‌ها باید به صورت آرایه باشند.',
            'items.min' => 'حداقل یک آیتم الزامی است.',
            'items.*.item_id.required' => 'انتخاب آیتم الزامی است.',
            'items.*.item_id.exists' => 'آیتم انتخاب شده معتبر نیست.',
            'items.*.quantity.required' => 'تعداد آیتم الزامی است.',
            'items.*.quantity.integer' => 'تعداد آیتم باید عدد صحیح باشد.',
            'items.*.quantity.min' => 'تعداد آیتم باید حداقل ۱ باشد.',
            'items.*.unit_price.numeric' => 'قیمت واحد باید عدد باشد.',
            'items.*.unit_price.min' => 'قیمت واحد نمی‌تواند منفی باشد.',
            'items.*.body_part_id.exists' => 'عضو بدن انتخاب شده معتبر نیست.',
        ];
    }
}
