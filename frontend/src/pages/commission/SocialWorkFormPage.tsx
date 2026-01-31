import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import FormField from '../../components/ui/FormField';
import SelectField from '../../components/ui/SelectField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { commissionApi } from '../../api/commission';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const socialWorkSchema = z.object({
  case_number: z.string().optional(),
  employee_id: z.string().min(1, 'شناسه بیمه‌شده الزامی است'),
  description: z.string().min(1, 'توضیحات الزامی است'),
  status: z.string().optional(),
});

type SocialWorkFormValues = z.infer<typeof socialWorkSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SocialWorkFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Resolution state (for existing cases) ------------------------------
  const [resolutionText, setResolutionText] = useState('');

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: socialWork,
    isLoading: caseLoading,
    isError,
  } = useQuery({
    queryKey: ['social-work-case', numericId],
    queryFn: () => commissionApi.socialWork.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocialWorkFormValues>({
    resolver: zodResolver(socialWorkSchema),
    defaultValues: {
      case_number: '',
      employee_id: '',
      description: '',
      status: '',
    },
  });

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (socialWork) {
      reset({
        case_number: socialWork.case_number || '',
        employee_id: socialWork.employee_id != null ? String(socialWork.employee_id) : '',
        description: socialWork.description || '',
        status: socialWork.status || '',
      });
    }
  }, [socialWork, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => commissionApi.socialWork.create(data),
    onSuccess: () => {
      toast.success('پرونده مددکاری با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['social-work'] });
      navigate('/commission/social-work');
    },
    onError: () => {
      toast.error('خطا در ایجاد پرونده مددکاری');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => commissionApi.socialWork.update(numericId, data),
    onSuccess: () => {
      toast.success('پرونده مددکاری با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['social-work'] });
      queryClient.invalidateQueries({ queryKey: ['social-work-case', numericId] });
      navigate('/commission/social-work');
    },
    onError: () => {
      toast.error('خطا در ویرایش پرونده مددکاری');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (data: { resolution: string }) => commissionApi.socialWork.resolve(numericId, data),
    onSuccess: () => {
      toast.success('نتیجه پیگیری با موفقیت ثبت شد');
      queryClient.invalidateQueries({ queryKey: ['social-work-case', numericId] });
      setResolutionText('');
    },
    onError: () => {
      toast.error('خطا در ثبت نتیجه پیگیری');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: SocialWorkFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'employee_id') {
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

  const handleResolveSubmit = () => {
    if (!resolutionText.trim()) {
      toast.error('متن نتیجه پیگیری الزامی است');
      return;
    }
    resolveMutation.mutate({ resolution: resolutionText.trim() });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ---- Loading / Error states (edit mode) ---------------------------------
  if (isEditing && caseLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !socialWork)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">پرونده مددکاری مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/commission/social-work')}>
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
        <h1 className="text-xl font-bold text-gray-800">پرونده مددکاری</h1>
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

            {/* status */}
            <FormField label="وضعیت" error={errors.status?.message}>
              <SelectField
                options={[
                  { value: 'pending', label: 'در انتظار' },
                  { value: 'in_progress', label: 'در حال پیگیری' },
                  { value: 'resolved', label: 'حل شده' },
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
                  placeholder="شرح پرونده مددکاری..."
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
          <Button type="button" variant="secondary" onClick={() => navigate('/commission/social-work')}>
            انصراف
          </Button>
        </div>
      </form>

      {/* ================================================================= */}
      {/* Resolution section (only for existing cases)                      */}
      {/* ================================================================= */}
      {isEditing && socialWork && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-800">ثبت نتیجه پیگیری</h2>

          {socialWork.resolution && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <span className="text-xs text-gray-500 block mb-1">نتیجه قبلی:</span>
              <p className="text-sm text-gray-800 leading-relaxed">{socialWork.resolution}</p>
            </div>
          )}

          <FormField label="متن نتیجه پیگیری">
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              className={inputClass}
              rows={4}
              placeholder="نتیجه پیگیری را وارد کنید..."
            />
          </FormField>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleResolveSubmit}
              loading={resolveMutation.isPending}
              disabled={!resolutionText.trim()}
            >
              ثبت نتیجه
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
