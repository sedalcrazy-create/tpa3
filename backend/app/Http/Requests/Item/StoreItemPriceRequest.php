<?php

namespace App\Http\Requests\Item;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemPriceRequest extends FormRequest
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
            'item_id' => ['required', 'exists:items,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'insurance_share_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'patient_share_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'effective_from' => ['required', 'date'],
            'effective_to' => ['nullable', 'date', 'after:effective_from'],
            'price_type' => ['nullable', 'in:approved,free,contractual'],
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
            'item_id.required' => 'شناسه آیتم الزامی است.',
            'item_id.exists' => 'آیتم انتخاب شده معتبر نیست.',
            'price.required' => 'قیمت الزامی است.',
            'price.numeric' => 'قیمت باید عددی باشد.',
            'price.min' => 'قیمت نمی‌تواند منفی باشد.',
            'insurance_share_percentage.numeric' => 'درصد سهم بیمه باید عددی باشد.',
            'insurance_share_percentage.min' => 'درصد سهم بیمه نمی‌تواند منفی باشد.',
            'insurance_share_percentage.max' => 'درصد سهم بیمه نمی‌تواند بیشتر از ۱۰۰ باشد.',
            'patient_share_percentage.numeric' => 'درصد سهم بیمار باید عددی باشد.',
            'patient_share_percentage.min' => 'درصد سهم بیمار نمی‌تواند منفی باشد.',
            'patient_share_percentage.max' => 'درصد سهم بیمار نمی‌تواند بیشتر از ۱۰۰ باشد.',
            'effective_from.required' => 'تاریخ شروع اعتبار الزامی است.',
            'effective_from.date' => 'فرمت تاریخ شروع اعتبار نامعتبر است.',
            'effective_to.date' => 'فرمت تاریخ پایان اعتبار نامعتبر است.',
            'effective_to.after' => 'تاریخ پایان اعتبار باید بعد از تاریخ شروع باشد.',
            'price_type.in' => 'نوع قیمت باید یکی از مقادیر مصوب، آزاد یا قراردادی باشد.',
        ];
    }
}
