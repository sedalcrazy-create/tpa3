import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import FormField from '../../components/ui/FormField';
import SelectField from '../../components/ui/SelectField';
import DatePicker from '../../components/ui/DatePicker';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { commissionApi } from '../../api/commission';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const caseSchema = z.object({
  case_number: z.string().optional(),
  employee_id: z.string().min(1, 'شناسه بیمه‌شده الزامی است'),
  claim_id: z.string().optional(),
  description: z.string().min(1, 'توضیحات الزامی است'),
  commission_date: z.string().optional(),
  status: z.string().optional(),
});

type CaseFormValues = z.infer<typeof caseSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CommissionCaseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Verdict state (for existing cases) ---------------------------------
  const [verdictText, setVerdictText] = useState('');

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: commissionCase,
    isLoading: caseLoading,
    isError,
  } = useQuery({
    queryKey: ['commission-case', numericId],
    queryFn: () => commissionApi.cases.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      case_number: '',
      employee_id: '',
      claim_id: '',
      description: '',
      commission_date: '',
      status: '',
    },
  });

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (commissionCase) {
      reset({
        case_number: commissionCase.case_number || '',
        employee_id: commissionCase.employee_id != null ? String(commissionCase.employee_id) : '',
        claim_id: commissionCase.claim_id != null ? String(commissionCase.claim_id) : '',
        description: commissionCase.description || '',
        commission_date: commissionCase.commission_date || '',
        status: commissionCase.status || '',
      });
    }
  }, [commissionCase, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => commissionApi.cases.create(data),
    onSuccess: () => {
      toast.success('پرونده کمیسیون با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['commission-cases'] });
      navigate('/commission/cases');
    },
    onError: () => {
      toast.error('خطا در ایجاد پرونده کمیسیون');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => commissionApi.cases.update(numericId, data),
    onSuccess: () => {
      toast.success('پرونده کمیسیون با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['commission-cases'] });
      queryClient.invalidateQueries({ queryKey: ['commission-case', numericId] });
      navigate('/commission/cases');
    },
    onError: () => {
      toast.error('خطا در ویرایش پرونده کمیسیون');
    },
  });

  const verdictMutation = useMutation({
    mutationFn: (data: { verdict: string }) => commissionApi.cases.addVerdict(numericId, data),
    onSuccess: () => {
      toast.success('رای کمیسیون با موفقیت ثبت شد');
      queryClient.invalidateQueries({ queryKey: ['commission-case', numericId] });
      setVerdictText('');
    },
    onError: () => {
      toast.error('خطا در ثبت رای کمیسیون');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: CaseFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'employee_id' || key === 'claim_id') {
        payload[key] = Number(value);
      } else {
        payload[key] = value;
      }
    });

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleVerdictSubmit = () => {
    if (!verdictText.trim()) {
      toast.error('متن رای الزامی است');
      return;
    }
    verdictMutation.mutate({ verdict: verdictText.trim() });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ---- Can add verdict? ---------------------------------------------------
  const canAddVerdict =
    isEditing &&
    commissionCase &&
    commissionCase.status !== 'closed' &&
    commissionCase.status !== 'cancelled';

  // ---- Loading / Error states (edit mode) ---------------------------------
  if (isEditing && caseLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !commissionCase)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">پرونده کمیسیون مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/commission/cases')}>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">پرونده کمیسیون</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* case_number */}
            <FormField label="شماره پرونده" error={errors.case_number?.message}>
              <input {...register('case_number')} className={inputClass} placeholder="شماره پرونده" />
            </FormField>

            {/* employee_id */}
            <FormField label="شناسه بیمه‌شده" required error={errors.employee_id?.message}>
              <input {...register('employee_id')} className={inputClass} placeholder="شناسه بیمه‌شده" dir="ltr" />
            </FormField>

            {/* claim_id */}
            <FormField label="شناسه پرونده خسارت" error={errors.claim_id?.message}>
              <input {...register('claim_id')} className={inputClass} placeholder="شناسه پرونده خسارت" dir="ltr" />
            </FormField>

            {/* commission_date */}
            <FormField label="تاریخ کمیسیون" error={errors.commission_date?.message}>
              <Controller
                name="commission_date"
                control={control}
                render={({ field }) => (
                  <DatePicker value={field.value || ''} onChange={field.onChange} />
                )}
              />
            </FormField>

            {/* status */}
            <FormField label="وضعیت" error={errors.status?.message}>
              <SelectField
                options={[
                  { value: 'pending', label: 'در انتظار' },
                  { value: 'in_progress', label: 'در حال بررسی' },
                  { value: 'closed', label: 'بسته شده' },
                  { value: 'cancelled', label: 'لغو شده' },
                ]}
                placeholder="انتخاب وضعیت..."
                {...register('status')}
              />
            </FormField>

            {/* description - full width */}
            <div className="md:col-span-2">
              <FormField label="توضیحات" required error={errors.description?.message}>
                <textarea
                  {...register('description')}
                  className={inputClass}
                  rows={4}
                  placeholder="شرح پرونده کمیسیون..."
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSaving}>
            ذخیره
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/commission/cases')}>
            انصراف
          </Button>
        </div>
      </form>

      {/* ================================================================= */}
      {/* Verdict section (only for existing cases with allowed status)     */}
      {/* ================================================================= */}
      {canAddVerdict && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-800">ثبت رای کمیسیون</h2>

          {commissionCase.verdict && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <span className="text-xs text-gray-500 block mb-1">رای قبلی:</span>
              <p className="text-sm text-gray-800 leading-relaxed">{commissionCase.verdict}</p>
            </div>
          )}

          <FormField label="متن رای">
            <textarea
              value={verdictText}
              onChange={(e) => setVerdictText(e.target.value)}
              className={inputClass}
              rows={4}
              placeholder="متن رای کمیسیون را وارد کنید..."
            />
          </FormField>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleVerdictSubmit}
              loading={verdictMutation.isPending}
              disabled={!verdictText.trim()}
            >
              ثبت رای
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
