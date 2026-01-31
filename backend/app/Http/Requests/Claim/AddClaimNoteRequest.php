<?php

namespace App\Http\Requests\Claim;

use Illuminate\Foundation\Http\FormRequest;

class AddClaimNoteRequest extends FormRequest
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
            'note' => ['required', 'string'],
            'note_type' => ['nullable', 'in:general,rejection,approval,return'],
            'is_internal' => ['nullable', 'boolean'],
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
            'note.required' => 'متن یادداشت الزامی است.',
            'note.string' => 'متن یادداشت باید متن باشد.',
            'note_type.in' => 'نوع یادداشت باید یکی از مقادیر عمومی، رد، تایید یا برگشت باشد.',
            'is_internal.boolean' => 'فیلد داخلی بودن باید صحیح یا غلط باشد.',
        ];
    }
}
