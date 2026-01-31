<?php

namespace App\Http\Requests\Settlement;

use Illuminate\Foundation\Http\FormRequest;

class StoreAggregationRequest extends FormRequest
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
            'center_id' => ['required', 'exists:centers,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after:period_start'],
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
            'center_id.required' => 'مرکز درمانی الزامی است.',
            'center_id.exists' => 'مرکز درمانی انتخاب شده معتبر نیست.',
            'contract_id.exists' => 'قرارداد انتخاب شده معتبر نیست.',
            'period_start.required' => 'تاریخ شروع دوره الزامی است.',
            'period_start.date' => 'فرمت تاریخ شروع دوره نامعتبر است.',
            'period_end.required' => 'تاریخ پایان دوره الزامی است.',
            'period_end.date' => 'فرمت تاریخ پایان دوره نامعتبر است.',
            'period_end.after' => 'تاریخ پایان دوره باید بعد از تاریخ شروع باشد.',
            'notes.string' => 'توضیحات باید متن باشد.',
        ];
    }
}
