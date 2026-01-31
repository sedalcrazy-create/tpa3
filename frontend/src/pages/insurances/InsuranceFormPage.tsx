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

import { useInsuranceTypes } from '../../hooks/useLookups';
import { insurancesApi } from '../../api/insurances';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const insuranceSchema = z.object({
  employee_id: z.string().min(1, 'شناسه پرسنل الزامی است'),
  insurance_type_id: z.string().optional(),
  insurance_number: z.string().optional(),
  start_date: z.string().min(1, 'تاریخ شروع الزامی است'),
  end_date: z.string().min(1, 'تاریخ پایان الزامی است'),
  ceiling_amount: z.string().optional(),
  status: z.string().optional(),
  is_active: z.boolean().optional(),
});

type InsuranceFormValues = z.infer<typeof insuranceSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function InsuranceFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Lookups ------------------------------------------------------------
  const { data: insuranceTypes = [], isLoading: insuranceTypesLoading } = useInsuranceTypes();

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: insurance,
    isLoading: insuranceLoading,
    isError,
  } = useQuery({
    queryKey: ['insurance', numericId],
    queryFn: () => insurancesApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      employee_id: '',
      insurance_type_id: '',
      insurance_number: '',
      start_date: '',
      end_date: '',
      ceiling_amount: '',
      status: '',
      is_active: true,
    },
  });

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (insurance) {
      reset({
        employee_id: insurance.employee_id != null ? String(insurance.employee_id) : '',
        insurance_type_id: insurance.insurance_type_id != null ? String(insurance.insurance_type_id) : '',
        insurance_number: insurance.insurance_number || '',
        start_date: insurance.start_date || '',
        end_date: insurance.end_date || '',
        ceiling_amount: insurance.ceiling_amount != null ? String(insurance.ceiling_amount) : '',
        status: insurance.status || '',
        is_active: insurance.is_active ?? true,
      });
    }
  }, [insurance, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => insurancesApi.create(data),
    onSuccess: () => {
      toast.success('بیمه‌نامه با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      navigate('/insurances');
    },
    onError: () => {
      toast.error('خطا در ایجاد بیمه‌نامه');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => insurancesApi.update(numericId, data),
    onSuccess: () => {
      toast.success('بیمه‌نامه با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      navigate('/insurances');
    },
    onError: () => {
      toast.error('خطا در ویرایش بیمه‌نامه');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: InsuranceFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'is_active') {
          payload[key] = value;
        } else if (key === 'employee_id' || key === 'insurance_type_id' || key === 'ceiling_amount') {
          payload[key] = Number(value);
        } else {
          payload[key] = value;
        }
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
  if (isEditing && insuranceLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !insurance)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">بیمه‌نامه مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/insurances')}>
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
          {isEditing ? 'ویرایش بیمه‌نامه' : 'ایجاد بیمه‌نامه'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {/* employee_id */}
          <FormField label="شناسه پرسنل" required error={errors.employee_id?.message}>
            <input
              {...register('employee_id')}
              className={inputClass}
              placeholder="شناسه یا جستجوی پرسنل"
            />
          </FormField>

          {/* insurance_type_id */}
          <FormField label="نوع بیمه" error={errors.insurance_type_id?.message}>
            <SelectField
              options={insuranceTypes}
              loading={insuranceTypesLoading}
              {...register('insurance_type_id')}
            />
          </FormField>

          {/* insurance_number */}
          <FormField label="شماره بیمه‌نامه" error={errors.insurance_number?.message}>
            <input {...register('insurance_number')} className={inputClass} />
          </FormField>

          {/* start_date */}
          <FormField label="تاریخ شروع" required error={errors.start_date?.message}>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <DatePicker value={field.value || ''} onChange={field.onChange} />
              )}
            />
          </FormField>

          {/* end_date */}
          <FormField label="تاریخ پایان" required error={errors.end_date?.message}>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <DatePicker value={field.value || ''} onChange={field.onChange} />
              )}
            />
          </FormField>

          {/* ceiling_amount */}
          <FormField label="سقف بیمه (ریال)" error={errors.ceiling_amount?.message}>
            <input
              {...register('ceiling_amount')}
              className={inputClass}
              dir="ltr"
              placeholder="مبلغ سقف بیمه"
            />
          </FormField>

          {/* status */}
          <FormField label="وضعیت" error={errors.status?.message}>
            <SelectField
              options={[
                { value: 'active', label: 'فعال' },
                { value: 'expired', label: 'منقضی' },
                { value: 'cancelled', label: 'لغو شده' },
              ]}
              {...register('status')}
            />
          </FormField>

          {/* is_active */}
          <FormField label="فعال" error={errors.is_active?.message}>
            <label className="inline-flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">بیمه‌نامه فعال است</span>
            </label>
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button type="submit" loading={isSaving}>
            ذخیره
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/insurances')}>
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
