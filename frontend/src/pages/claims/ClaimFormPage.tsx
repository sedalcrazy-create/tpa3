import { useEffect } from 'react';
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

import { claimsApi } from '../../api/claims';
import { useClaimTypes, useClaimStatuses } from '../../hooks/useLookups';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const claimSchema = z.object({
  claim_number: z.string().min(1, 'شماره پرونده الزامی است'),
  employee_id: z.string().min(1, 'بیمه‌شده الزامی است'),
  insurance_id: z.string().optional(),
  center_id: z.string().optional(),
  claim_type_id: z.string().min(1, 'نوع خسارت الزامی است'),
  claim_date: z.string().min(1, 'تاریخ خسارت الزامی است'),
  total_amount: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

type ClaimFormValues = z.infer<typeof claimSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ClaimFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Lookups ------------------------------------------------------------
  const { data: claimTypeOptions = [] } = useClaimTypes();
  const { data: claimStatusOptions = [] } = useClaimStatuses();

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: claim,
    isLoading: claimLoading,
    isError,
  } = useQuery({
    queryKey: ['claim', numericId],
    queryFn: () => claimsApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      claim_number: '',
      employee_id: '',
      insurance_id: '',
      center_id: '',
      claim_type_id: '',
      claim_date: '',
      total_amount: '',
      description: '',
      status: '',
    },
  });

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (claim) {
      reset({
        claim_number: claim.claim_number || '',
        employee_id: claim.employee_id != null ? String(claim.employee_id) : '',
        insurance_id: claim.insurance_id != null ? String(claim.insurance_id) : '',
        center_id: claim.center_id != null ? String(claim.center_id) : '',
        claim_type_id: claim.claim_type_id != null ? String(claim.claim_type_id) : '',
        claim_date: claim.claim_date || '',
        total_amount: claim.total_amount != null ? String(claim.total_amount) : '',
        description: claim.description || '',
        status: claim.status || '',
      });
    }
  }, [claim, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => claimsApi.create(data),
    onSuccess: () => {
      toast.success('پرونده خسارت با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      navigate('/claims');
    },
    onError: () => {
      toast.error('خطا در ایجاد پرونده خسارت');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => claimsApi.update(numericId, data),
    onSuccess: () => {
      toast.success('پرونده خسارت با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim', numericId] });
      navigate('/claims');
    },
    onError: () => {
      toast.error('خطا در ویرایش پرونده خسارت');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: ClaimFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (
        key === 'employee_id' ||
        key === 'insurance_id' ||
        key === 'center_id' ||
        key === 'claim_type_id'
      ) {
        payload[key] = Number(value);
      } else if (key === 'total_amount') {
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ---- Loading / Error states (edit mode) ---------------------------------
  if (isEditing && claimLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !claim)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">پرونده خسارت مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/claims')}>
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
        <h1 className="text-xl font-bold text-gray-800">
          {isEditing ? 'ویرایش پرونده خسارت' : 'ایجاد پرونده خسارت'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* claim_number */}
            <FormField label="شماره پرونده" required error={errors.claim_number?.message}>
              <input {...register('claim_number')} className={inputClass} placeholder="شماره پرونده" />
            </FormField>

            {/* employee_id */}
            <FormField label="شناسه بیمه‌شده" required error={errors.employee_id?.message}>
              <input {...register('employee_id')} className={inputClass} placeholder="شناسه بیمه‌شده" dir="ltr" />
            </FormField>

            {/* insurance_id */}
            <FormField label="شناسه بیمه‌نامه" error={errors.insurance_id?.message}>
              <input {...register('insurance_id')} className={inputClass} placeholder="شناسه بیمه‌نامه" dir="ltr" />
            </FormField>

            {/* center_id */}
            <FormField label="شناسه مرکز درمانی" error={errors.center_id?.message}>
              <input {...register('center_id')} className={inputClass} placeholder="شناسه مرکز" dir="ltr" />
            </FormField>

            {/* claim_type_id */}
            <FormField label="نوع خسارت" required error={errors.claim_type_id?.message}>
              <SelectField
                options={claimTypeOptions}
                placeholder="انتخاب نوع خسارت..."
                {...register('claim_type_id')}
              />
            </FormField>

            {/* claim_date */}
            <FormField label="تاریخ خسارت" required error={errors.claim_date?.message}>
              <Controller
                name="claim_date"
                control={control}
                render={({ field }) => (
                  <DatePicker value={field.value || ''} onChange={field.onChange} />
                )}
              />
            </FormField>

            {/* total_amount */}
            <FormField label="مبلغ کل (ریال)" error={errors.total_amount?.message}>
              <input
                {...register('total_amount')}
                type="number"
                min="0"
                className={inputClass}
                placeholder="مبلغ کل"
                dir="ltr"
              />
            </FormField>

            {/* status */}
            <FormField label="وضعیت" error={errors.status?.message}>
              <SelectField
                options={claimStatusOptions}
                placeholder="انتخاب وضعیت..."
                {...register('status')}
              />
            </FormField>

            {/* description - full width */}
            <div className="md:col-span-2">
              <FormField label="توضیحات" error={errors.description?.message}>
                <textarea
                  {...register('description')}
                  className={inputClass}
                  rows={3}
                  placeholder="توضیحات پرونده..."
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
          <Button type="button" variant="secondary" onClick={() => navigate('/claims')}>
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
