<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class ImportEmployeeRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx', 'max:10240'],
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
            'file.required' => 'فایل الزامی است.',
            'file.file' => 'فایل آپلود شده معتبر نیست.',
            'file.mimes' => 'فرمت فایل باید csv، txt یا xlsx باشد.',
            'file.max' => 'حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.',
        ];
    }
}
