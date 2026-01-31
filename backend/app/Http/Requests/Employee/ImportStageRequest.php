<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class ImportStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:102400'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'فایل الزامی است.',
            'file.file' => 'فایل آپلود شده معتبر نیست.',
            'file.mimes' => 'فرمت فایل باید xlsx یا xls باشد.',
            'file.max' => 'حجم فایل نباید بیشتر از ۱۰۰ مگابایت باشد.',
        ];
    }
}
