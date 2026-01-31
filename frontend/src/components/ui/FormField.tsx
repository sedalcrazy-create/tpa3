import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  horizontal?: boolean;
  children: ReactNode;
}

export default function FormField({
  label,
  error,
  required = false,
  horizontal = true,
  children,
}: FormFieldProps) {
  if (horizontal) {
    return (
      <div className="flex items-start gap-3 mb-3">
        <label className="w-36 shrink-0 text-sm font-medium text-gray-700 pt-2 text-start">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
        <div className="flex-1">
          {children}
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
