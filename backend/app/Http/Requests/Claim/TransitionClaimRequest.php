<?php

namespace App\Http\Requests\Claim;

use Illuminate\Foundation\Http\FormRequest;

class TransitionClaimRequest extends FormRequest
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
            'status' => ['required', 'integer', 'in:1,2,3,4,5,6,8'],
            'note' => ['nullable', 'string'],
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
            'status.required' => 'وضعیت جدید الزامی است.',
            'status.integer' => 'وضعیت باید عدد صحیح باشد.',
            'status.in' => 'وضعیت انتخاب شده معتبر نیست.',
            'note.string' => 'یادداشت باید متن باشد.',
        ];
    }
}
