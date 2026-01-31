import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PencilIcon,
  ArrowRightIcon,
  CalculatorIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

import { invoicesApi } from '../../api/invoices';
import { formatDate, formatCurrency } from '../../utils/format';
import type { Invoice, InvoiceItem } from '../../types/invoice';

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-40 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value || '-'}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function InvoiceViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericId = Number(id);

  const [submitOpen, setSubmitOpen] = useState(false);

  // ---- Fetch invoice data -------------------------------------------------
  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['invoice', numericId],
    queryFn: () => invoicesApi.get(numericId),
    enabled: !!numericId,
  });

  // ---- Calculate mutation -------------------------------------------------
  const calculateMutation = useMutation({
    mutationFn: () => invoicesApi.calculate(numericId),
    onSuccess: () => {
      toast.success('محاسبه با موفقیت انجام شد');
      queryClient.invalidateQueries({ queryKey: ['invoice', numericId] });
    },
    onError: () => {
      toast.error('خطا در محاسبه صورتحساب');
    },
  });

  // ---- Submit mutation ----------------------------------------------------
  const submitMutation = useMutation({
    mutationFn: () => invoicesApi.submit(numericId),
    onSuccess: () => {
      toast.success('صورتحساب با موفقیت ثبت نهایی شد');
      queryClient.invalidateQueries({ queryKey: ['invoice', numericId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setSubmitOpen(false);
    },
    onError: () => {
      toast.error('خطا در ثبت نهایی صورتحساب');
    },
  });

  // ---- Loading / Error states ---------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">صورتحساب مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/invoices')}>
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  // ---- Compute summary totals ---------------------------------------------
  const items: InvoiceItem[] = invoice.items || [];

  const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const totalApproved = items.reduce((sum, item) => sum + (item.approved_price || 0), 0);
  const totalInsuranceShare = items.reduce((sum, item) => sum + (item.insurance_share || 0), 0);
  const totalPatientShare = items.reduce((sum, item) => sum + (item.patient_share || 0), 0);
  const totalDeduction = items.reduce((sum, item) => sum + (item.deduction || 0), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">جزئیات صورتحساب</h1>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={<CalculatorIcon className="w-4 h-4" />}
            onClick={() => calculateMutation.mutate()}
            loading={calculateMutation.isPending}
          >
            محاسبه
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<CheckCircleIcon className="w-4 h-4" />}
            onClick={() => setSubmitOpen(true)}
          >
            ثبت نهایی
          </Button>
          <Link to={`/invoices/${numericId}/edit`}>
            <Button variant="secondary" size="sm" icon={<PencilIcon className="w-4 h-4" />}>
              ویرایش
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRightIcon className="w-4 h-4" />}
            onClick={() => navigate('/invoices')}
          >
            بازگشت
          </Button>
        </div>
      </div>

      {/* Invoice header info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">اطلاعات صورتحساب</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <DetailRow label="شماره صورتحساب" value={invoice.invoice_number} />
          <DetailRow label="تاریخ صورتحساب" value={formatDate(invoice.invoice_date)} />
          <DetailRow label="نام بیمه‌شده" value={invoice.employee_name} />
          <DetailRow label="مرکز درمانی" value={invoice.center_name} />
          <DetailRow label="شناسه پرونده" value={invoice.claim_id} />
          <DetailRow
            label="وضعیت"
            value={
              <StatusBadge
                status={invoice.status}
                label={invoice.status_title}
              />
            }
          />
          <DetailRow label="مبلغ کل" value={formatCurrency(invoice.total_amount)} />
          <DetailRow label="مبلغ تایید شده" value={formatCurrency(invoice.approved_amount ?? 0)} />
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">اقلام صورتحساب</h2>

        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">اقلامی ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-10">ردیف</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">نام آیتم</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-20">تعداد</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">قیمت واحد</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">قیمت کل</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">قیمت تایید شده</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">سهم بیمه</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">سهم بیمار</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">کسورات</th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">تخفیف</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id ?? index}
                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-3 py-2.5 text-gray-500">{index + 1}</td>
                    <td className="px-3 py-2.5 text-gray-700">{item.item_name || '-'}</td>
                    <td className="px-3 py-2.5 text-gray-700">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-gray-700">{formatCurrency(item.unit_price)}</td>
                    <td className="px-3 py-2.5 text-gray-700">{formatCurrency(item.total_price)}</td>
                    <td className="px-3 py-2.5 text-gray-700">{formatCurrency(item.approved_price ?? 0)}</td>
                    <td className="px-3 py-2.5 text-gray-700">{formatCurrency(item.insurance_share ?? 0)}</td>
                    <td className="px-3 py-2.5 text-gray-700">{formatCurrency(item.patient_share ?? 0)}</td>
                    <td className="px-3 py-2.5 text-gray-700">{formatCurrency(item.deduction ?? 0)}</td>
                    <td className="px-3 py-2.5 text-gray-700">{formatCurrency(item.discount ?? 0)}</td>
                  </tr>
                ))}

                {/* Summary row */}
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <td className="px-3 py-3 text-gray-700" colSpan={2}>جمع کل</td>
                  <td className="px-3 py-3 text-gray-700" />
                  <td className="px-3 py-3 text-gray-700" />
                  <td className="px-3 py-3 text-gray-700">{formatCurrency(totalAmount)}</td>
                  <td className="px-3 py-3 text-gray-700">{formatCurrency(totalApproved)}</td>
                  <td className="px-3 py-3 text-gray-700">{formatCurrency(totalInsuranceShare)}</td>
                  <td className="px-3 py-3 text-gray-700">{formatCurrency(totalPatientShare)}</td>
                  <td className="px-3 py-3 text-gray-700">{formatCurrency(totalDeduction)}</td>
                  <td className="px-3 py-3 text-gray-700">{formatCurrency(totalDiscount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit confirm dialog */}
      <ConfirmDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onConfirm={() => submitMutation.mutate()}
        title="تایید ثبت نهایی"
        message="آیا از ثبت نهایی این صورتحساب اطمینان دارید؟ پس از ثبت نهایی امکان ویرایش وجود نخواهد داشت."
        confirmLabel="ثبت نهایی"
        loading={submitMutation.isPending}
      />
    </div>
  );
}
