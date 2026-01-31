import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FormField from '../../components/ui/FormField';
import DatePicker from '../../components/ui/DatePicker';

import { settlementsApi } from '../../api/settlements';
import { formatDate, formatCurrency } from '../../utils/format';

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
export default function SettlementViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericId = Number(id);

  // ---- Local state --------------------------------------------------------
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payForm, setPayForm] = useState({
    payment_date: '',
    payment_reference: '',
  });

  // ---- Fetch settlement data ----------------------------------------------
  const {
    data: settlement,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['settlement', numericId],
    queryFn: () => settlementsApi.get(numericId),
    enabled: !!numericId,
  });

  // ---- Approve mutation ---------------------------------------------------
  const approveMutation = useMutation({
    mutationFn: () => settlementsApi.approve(numericId),
    onSuccess: () => {
      toast.success('تسویه با موفقیت تایید شد');
      queryClient.invalidateQueries({ queryKey: ['settlement', numericId] });
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      setApproveConfirm(false);
    },
    onError: () => {
      toast.error('خطا در تایید تسویه');
    },
  });

  // ---- Pay mutation -------------------------------------------------------
  const payMutation = useMutation({
    mutationFn: (data: { payment_date: string; payment_reference?: string }) =>
      settlementsApi.pay(numericId, data),
    onSuccess: () => {
      toast.success('پرداخت با موفقیت ثبت شد');
      queryClient.invalidateQueries({ queryKey: ['settlement', numericId] });
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      setPayModal(false);
      setPayForm({ payment_date: '', payment_reference: '' });
    },
    onError: () => {
      toast.error('خطا در ثبت پرداخت');
    },
  });

  // ---- Pay form submit ----------------------------------------------------
  const handlePaySubmit = () => {
    if (!payForm.payment_date) {
      toast.error('تاریخ پرداخت الزامی است');
      return;
    }
    payMutation.mutate({
      payment_date: payForm.payment_date,
      payment_reference: payForm.payment_reference || undefined,
    });
  };

  // ---- Loading / Error states ---------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !settlement) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">تسویه مالی مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/settlements')}>
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  // ---- Input class --------------------------------------------------------
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary';

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">جزئیات تسویه</h1>
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowRightIcon className="w-4 h-4" />}
          onClick={() => navigate('/settlements')}
        >
          بازگشت
        </Button>
      </div>

      {/* ================================================================= */}
      {/* Settlement details card                                           */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">اطلاعات تسویه</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <DetailRow label="شناسه" value={settlement.id} />
          <DetailRow label="شماره تسویه" value={settlement.settlement_number} />
          <DetailRow label="مرکز درمانی" value={settlement.center_name} />
          <DetailRow label="مبلغ کل" value={formatCurrency(settlement.total_amount)} />
          <DetailRow label="مبلغ تایید شده" value={formatCurrency(settlement.approved_amount ?? 0)} />
          <DetailRow label="مبلغ پرداخت شده" value={formatCurrency(settlement.paid_amount ?? 0)} />
          <DetailRow
            label="وضعیت"
            value={
              <StatusBadge
                status={settlement.status}
                label={settlement.status_title}
              />
            }
          />
          <DetailRow label="تاریخ تسویه" value={formatDate(settlement.settlement_date)} />
          <DetailRow label="تاریخ پرداخت" value={formatDate(settlement.payment_date)} />
          <DetailRow label="تاریخ ایجاد" value={formatDate(settlement.created_at)} />
        </div>
      </div>

      {/* ================================================================= */}
      {/* Action buttons                                                    */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">عملیات</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => setApproveConfirm(true)}
          >
            تایید
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPayModal(true)}
          >
            پرداخت
          </Button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Approve confirm dialog                                            */}
      {/* ================================================================= */}
      <ConfirmDialog
        open={approveConfirm}
        onClose={() => setApproveConfirm(false)}
        onConfirm={() => approveMutation.mutate()}
        title="تایید تسویه"
        message="آیا از تایید این تسویه مالی اطمینان دارید؟"
        confirmLabel="تایید"
        loading={approveMutation.isPending}
      />

      {/* ================================================================= */}
      {/* Pay modal                                                         */}
      {/* ================================================================= */}
      <Modal
        open={payModal}
        onClose={() => {
          setPayModal(false);
          setPayForm({ payment_date: '', payment_reference: '' });
        }}
        title="ثبت پرداخت"
        size="sm"
      >
        <div className="space-y-4">
          <FormField label="تاریخ پرداخت" required>
            <DatePicker
              value={payForm.payment_date}
              onChange={(val) => setPayForm((prev) => ({ ...prev, payment_date: val }))}
            />
          </FormField>

          <FormField label="شماره مرجع پرداخت">
            <input
              value={payForm.payment_reference}
              onChange={(e) =>
                setPayForm((prev) => ({ ...prev, payment_reference: e.target.value }))
              }
              className={inputClass}
              placeholder="شماره مرجع یا شناسه تراکنش"
              dir="ltr"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPayModal(false);
                setPayForm({ payment_date: '', payment_reference: '' });
              }}
            >
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={handlePaySubmit}
              loading={payMutation.isPending}
            >
              ثبت پرداخت
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
