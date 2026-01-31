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

import { useCenterTypes } from '../../hooks/useLookups';
import { contractsApi } from '../../api/contracts';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const contractSchema = z.object({
  contract_number: z.string().min(1, 'شماره قرارداد الزامی است'),
  title: z.string().min(1, 'عنوان قرارداد الزامی است'),
  center_id: z.string().min(1, 'مرکز درمانی الزامی است'),
  start_date: z.string().min(1, 'تاریخ شروع الزامی است'),
  end_date: z.string().min(1, 'تاریخ پایان الزامی است'),
  max_ceiling: z.string().optional(),
  status: z.string().optional(),
  is_active: z.boolean().optional(),
});

type ContractFormValues = z.infer<typeof contractSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ContractFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Lookups ------------------------------------------------------------
  const { data: centerTypes = [], isLoading: centerTypesLoading } = useCenterTypes();

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: contract,
    isLoading: contractLoading,
    isError,
  } = useQuery({
    queryKey: ['contract', numericId],
    queryFn: () => contractsApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contract_number: '',
      title: '',
      center_id: '',
      start_date: '',
      end_date: '',
      max_ceiling: '',
      status: '',
      is_active: true,
    },
  });

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (contract) {
      reset({
        contract_number: contract.contract_number || '',
        title: contract.title || '',
        center_id: contract.center_id != null ? String(contract.center_id) : '',
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        max_ceiling: contract.max_ceiling != null ? String(contract.max_ceiling) : '',
        status: contract.status || '',
        is_active: contract.is_active ?? true,
      });
    }
  }, [contract, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => contractsApi.create(data),
    onSuccess: () => {
      toast.success('قرارداد با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      navigate('/contracts');
    },
    onError: () => {
      toast.error('خطا در ایجاد قرارداد');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => contractsApi.update(numericId, data),
    onSuccess: () => {
      toast.success('قرارداد با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      navigate('/contracts');
    },
    onError: () => {
      toast.error('خطا در ویرایش قرارداد');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: ContractFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'is_active') {
          payload[key] = value;
        } else if (key === 'center_id' || key === 'max_ceiling') {
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
  if (isEditing && contractLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !contract)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">قرارداد مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/contracts')}>
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
          {isEditing ? 'ویرایش قرارداد' : 'ایجاد قرارداد'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {/* contract_number */}
          <FormField label="شماره قرارداد" required error={errors.contract_number?.message}>
            <input {...register('contract_number')} className={inputClass} />
          </FormField>

          {/* title */}
          <FormField label="عنوان قرارداد" required error={errors.title?.message}>
            <input {...register('title')} className={inputClass} />
          </FormField>

          {/* center_id */}
          <FormField label="مرکز درمانی" required error={errors.center_id?.message}>
            <SelectField
              options={centerTypes}
              loading={centerTypesLoading}
              placeholder="انتخاب مرکز درمانی..."
              {...register('center_id')}
            />
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

          {/* max_ceiling */}
          <FormField label="سقف قرارداد (ریال)" error={errors.max_ceiling?.message}>
            <input
              {...register('max_ceiling')}
              className={inputClass}
              dir="ltr"
              placeholder="مبلغ سقف قرارداد"
            />
          </FormField>

          {/* status */}
          <FormField label="وضعیت" error={errors.status?.message}>
            <SelectField
              options={[
                { value: 'active', label: 'فعال' },
                { value: 'expired', label: 'منقضی' },
                { value: 'cancelled', label: 'لغو شده' },
                { value: 'draft', label: 'پیش‌نویس' },
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
              <span className="text-sm text-gray-700">قرارداد فعال است</span>
            </label>
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button type="submit" loading={isSaving}>
            ذخیره
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/contracts')}>
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
