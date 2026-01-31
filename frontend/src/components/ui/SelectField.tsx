import type { SelectHTMLAttributes } from 'react';
import type { SelectOption } from '../../types/api';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  loading?: boolean;
}

export default function SelectField({
  options,
  placeholder = 'انتخاب کنید...',
  loading = false,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <select
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary ${className}`}
      {...props}
    >
      <option value="">{loading ? 'در حال بارگذاری...' : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
