<?php

namespace App\Http\Requests\Item;

use Illuminate\Foundation\Http\FormRequest;

class UpdateItemRequest extends FormRequest
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
        $itemId = $this->route('item');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:500'],
            'generic_name' => ['sometimes', 'nullable', 'string', 'max:500'],
            'code' => ['sometimes', 'required', 'string', 'max:50', 'unique:items,code,' . $itemId],
            'item_category_id' => ['sometimes', 'nullable', 'exists:item_categories,id'],
            'item_sub_category_id' => ['sometimes', 'nullable', 'exists:item_sub_categories,id'],
            'item_group_id' => ['sometimes', 'nullable', 'exists:item_groups,id'],
            'item_type' => ['sometimes', 'required', 'in:drug,service,consumable,device'],
            'unit' => ['sometimes', 'nullable', 'string', 'max:50'],
            'dosage_form' => ['sometimes', 'nullable', 'string', 'max:100'],
            'strength' => ['sometimes', 'nullable', 'string', 'max:100'],
            'manufacturer' => ['sometimes', 'nullable', 'string', 'max:255'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'is_otc' => ['sometimes', 'nullable', 'boolean'],
            'is_covered' => ['sometimes', 'nullable', 'boolean'],
            'description' => ['sometimes', 'nullable', 'string'],
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
            'name.required' => 'نام آیتم الزامی است.',
            'name.string' => 'نام آیتم باید متن باشد.',
            'name.max' => 'نام آیتم نباید بیشتر از ۵۰۰ کاراکتر باشد.',
            'generic_name.string' => 'نام ژنریک باید متن باشد.',
            'generic_name.max' => 'نام ژنریک نباید بیشتر از ۵۰۰ کاراکتر باشد.',
            'code.required' => 'کد آیتم الزامی است.',
            'code.string' => 'کد آیتم باید متن باشد.',
            'code.max' => 'کد آیتم نباید بیشتر از ۵۰ کاراکتر باشد.',
            'code.unique' => 'این کد قبلاً ثبت شده است.',
            'item_category_id.exists' => 'دسته‌بندی انتخاب شده معتبر نیست.',
            'item_sub_category_id.exists' => 'زیردسته‌بندی انتخاب شده معتبر نیست.',
            'item_group_id.exists' => 'گروه انتخاب شده معتبر نیست.',
            'item_type.required' => 'نوع آیتم الزامی است.',
            'item_type.in' => 'نوع آیتم باید یکی از مقادیر دارو، خدمت، مصرفی یا تجهیزات باشد.',
            'unit.string' => 'واحد باید متن باشد.',
            'unit.max' => 'واحد نباید بیشتر از ۵۰ کاراکتر باشد.',
            'dosage_form.string' => 'شکل دارویی باید متن باشد.',
            'dosage_form.max' => 'شکل دارویی نباید بیشتر از ۱۰۰ کاراکتر باشد.',
            'strength.string' => 'قدرت دارو باید متن باشد.',
            'strength.max' => 'قدرت دارو نباید بیشتر از ۱۰۰ کاراکتر باشد.',
            'manufacturer.string' => 'نام تولیدکننده باید متن باشد.',
            'manufacturer.max' => 'نام تولیدکننده نباید بیشتر از ۲۵۵ کاراکتر باشد.',
            'country.string' => 'کشور باید متن باشد.',
            'country.max' => 'کشور نباید بیشتر از ۱۰۰ کاراکتر باشد.',
            'is_otc.boolean' => 'مقدار OTC باید صحیح یا غلط باشد.',
            'is_covered.boolean' => 'مقدار تحت پوشش باید صحیح یا غلط باشد.',
            'description.string' => 'توضیحات باید متن باشد.',
        ];
    }
}
