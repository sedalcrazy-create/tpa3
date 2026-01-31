import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { insurancesApi } from '../../api/insurances';
import { formatCurrency, formatDate } from '../../utils/format';
import type { InsuranceInquiry } from '../../types/insurance';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function InsuranceInquiryPage() {
  const [nationalCode, setNationalCode] = useState('');
  const [result, setResult] = useState<InsuranceInquiry | null>(null);

  // ---- Inquiry mutation ---------------------------------------------------
  const inquiryMutation = useMutation({
    mutationFn: (code: string) => insurancesApi.inquiry(code),
    onSuccess: (data) => {
      setResult(data);
    },
    onError: () => {
      toast.error('خطا در استعلام بیمه');
      setResult(null);
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const handleInquiry = () => {
    if (!nationalCode.trim()) {
      toast.error('لطفا کد ملی را وارد کنید');
      return;
    }
    inquiryMutation.mutate(nationalCode.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInquiry();
    }
  };

  // ---- Input class --------------------------------------------------------
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary';

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">استعلام بیمه</h1>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="max-w-md">
          <FormField label="کد ملی" required>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={nationalCode}
                onChange={(e) => setNationalCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="کد ملی را وارد کنید"
                dir="ltr"
                maxLength={10}
              />
              <Button
                type="button"
                onClick={handleInquiry}
                loading={inquiryMutation.isPending}
                icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              >
                استعلام
              </Button>
            </div>
          </FormField>
        </div>
      </div>

      {/* Loading */}
      {inquiryMutation.isPending && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Result Card */}
      {result && !inquiryMutation.isPending && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Validity status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">وضعیت استعلام:</span>
            {result.is_valid ? (
              <StatusBadge status="active" label="معتبر" />
            ) : (
              <StatusBadge status="expired" label="نامعتبر" />
            )}
          </div>

          {result.message && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {result.message}
            </p>
          )}

          {/* Employee Info */}
          {result.employee && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                اطلاعات بیمه‌شده
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">نام:</span>
                  <span className="text-sm text-gray-800">
                    {result.employee.first_name} {result.employee.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">کد ملی:</span>
                  <span className="text-sm text-gray-800 dir-ltr">{result.employee.national_code}</span>
                </div>
              </div>
            </div>
          )}

          {/* Insurance Info */}
          {result.insurance && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                اطلاعات بیمه‌نامه
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">شماره بیمه‌نامه:</span>
                  <span className="text-sm text-gray-800">{result.insurance.insurance_number || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">نوع بیمه:</span>
                  <span className="text-sm text-gray-800">{result.insurance.insurance_type_title || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">تاریخ شروع:</span>
                  <span className="text-sm text-gray-800">{formatDate(result.insurance.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">تاریخ پایان:</span>
                  <span className="text-sm text-gray-800">{formatDate(result.insurance.end_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">سقف بیمه:</span>
                  <span className="text-sm text-gray-800">
                    {result.insurance.ceiling_amount != null
                      ? formatCurrency(result.insurance.ceiling_amount)
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">مبلغ مصرفی:</span>
                  <span className="text-sm text-gray-800">
                    {result.insurance.used_amount != null
                      ? formatCurrency(result.insurance.used_amount)
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">مانده سقف:</span>
                  <span className="text-sm text-gray-800 font-medium">
                    {result.insurance.remaining_amount != null
                      ? formatCurrency(result.insurance.remaining_amount)
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-28 shrink-0">وضعیت:</span>
                  <StatusBadge
                    status={result.insurance.status}
                    label={result.insurance.status_title}
                  />
                </div>
              </div>
            </div>
          )}

          {/* No insurance found */}
          {!result.insurance && result.employee && (
            <p className="text-sm text-gray-500 bg-yellow-50 rounded-lg p-3">
              بیمه‌نامه فعالی برای این بیمه‌شده یافت نشد.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
