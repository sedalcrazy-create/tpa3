import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import FormField from '../../components/ui/FormField';
import SelectField from '../../components/ui/SelectField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { centersApi } from '../../api/centers';
import {
  useCenterTypes,
  useProvinces,
  useLocations,
} from '../../hooks/useLookups';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const centerSchema = z.object({
  name: z.string().min(1, 'نام مرکز الزامی است'),
  code: z.string().optional(),
  center_type_id: z.string().optional(),
  specialty_id: z.string().optional(),
  province_id: z.string().optional(),
  city_id: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  manager_name: z.string().optional(),
  license_number: z.string().optional(),
  is_active: z.boolean().optional(),
});

type CenterFormValues = z.infer<typeof centerSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CenterFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Province/city cascade state ----------------------------------------
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined);

  // ---- Lookups ------------------------------------------------------------
  const { data: centerTypeOptions = [] } = useCenterTypes();
  const { data: provinceOptions = [] } = useProvinces();
  const { data: cityOptions = [] } = useLocations(selectedProvinceId);

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: center,
    isLoading: centerLoading,
    isError,
  } = useQuery({
    queryKey: ['center', numericId],
    queryFn: () => centersApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CenterFormValues>({
    resolver: zodResolver(centerSchema),
    defaultValues: {
      name: '',
      code: '',
      center_type_id: '',
      specialty_id: '',
      province_id: '',
      city_id: '',
      address: '',
      phone: '',
      fax: '',
      manager_name: '',
      license_number: '',
      is_active: true,
    },
  });

  const watchedProvinceId = watch('province_id');

  // Sync province cascade
  useEffect(() => {
    const pid = watchedProvinceId ? Number(watchedProvinceId) : undefined;
    if (pid !== selectedProvinceId) {
      setSelectedProvinceId(pid);
      // Reset city when province changes (but not on initial load)
      if (selectedProvinceId !== undefined) {
        setValue('city_id', '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedProvinceId]);

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (center) {
      // Set province first so cities load
      if (center.province_id) {
        setSelectedProvinceId(center.province_id);
      }
      reset({
        name: center.name || '',
        code: center.code || '',
        center_type_id: center.center_type_id != null ? String(center.center_type_id) : '',
        specialty_id: center.specialty_id != null ? String(center.specialty_id) : '',
        province_id: center.province_id != null ? String(center.province_id) : '',
        city_id: center.city_id != null ? String(center.city_id) : '',
        address: center.address || '',
        phone: center.phone || '',
        fax: center.fax || '',
        manager_name: center.manager_name || '',
        license_number: center.license_number || '',
        is_active: center.is_active ?? true,
      });
    }
  }, [center, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => centersApi.create(data),
    onSuccess: () => {
      toast.success('مرکز درمانی با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      navigate('/centers');
    },
    onError: () => {
      toast.error('خطا در ایجاد مرکز درمانی');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => centersApi.update(numericId, data),
    onSuccess: () => {
      toast.success('مرکز درمانی با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      queryClient.invalidateQueries({ queryKey: ['center', numericId] });
      navigate('/centers');
    },
    onError: () => {
      toast.error('خطا در ویرایش مرکز درمانی');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: CenterFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (
        key === 'center_type_id' ||
        key === 'specialty_id' ||
        key === 'province_id' ||
        key === 'city_id'
      ) {
        payload[key] = Number(value);
      } else if (key === 'is_active') {
        payload[key] = value;
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
  if (isEditing && centerLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !center)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">مرکز درمانی مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/centers')}>
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
          {isEditing ? 'ویرایش مرکز درمانی' : 'ایجاد مرکز درمانی'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* name */}
            <FormField label="نام مرکز" required error={errors.name?.message}>
              <input {...register('name')} className={inputClass} placeholder="نام مرکز درمانی" />
            </FormField>

            {/* code */}
            <FormField label="کد مرکز" error={errors.code?.message}>
              <input {...register('code')} className={inputClass} placeholder="کد مرکز" />
            </FormField>

            {/* center_type_id */}
            <FormField label="نوع مرکز" error={errors.center_type_id?.message}>
              <SelectField
                options={centerTypeOptions}
                placeholder="انتخاب نوع مرکز..."
                {...register('center_type_id')}
              />
            </FormField>

            {/* province_id */}
            <FormField label="استان" error={errors.province_id?.message}>
              <SelectField
                options={provinceOptions}
                placeholder="انتخاب استان..."
                {...register('province_id')}
              />
            </FormField>

            {/* city_id */}
            <FormField label="شهر" error={errors.city_id?.message}>
              <SelectField
                options={cityOptions}
                placeholder="انتخاب شهر..."
                {...register('city_id')}
              />
            </FormField>

            {/* phone */}
            <FormField label="تلفن" error={errors.phone?.message}>
              <input {...register('phone')} className={inputClass} placeholder="شماره تلفن" dir="ltr" />
            </FormField>

            {/* fax */}
            <FormField label="فکس" error={errors.fax?.message}>
              <input {...register('fax')} className={inputClass} placeholder="شماره فکس" dir="ltr" />
            </FormField>

            {/* manager_name */}
            <FormField label="نام مدیر" error={errors.manager_name?.message}>
              <input {...register('manager_name')} className={inputClass} placeholder="نام مدیر مرکز" />
            </FormField>

            {/* license_number */}
            <FormField label="شماره مجوز" error={errors.license_number?.message}>
              <input {...register('license_number')} className={inputClass} placeholder="شماره مجوز فعالیت" />
            </FormField>

            {/* address - full width */}
            <div className="md:col-span-2">
              <FormField label="آدرس" error={errors.address?.message}>
                <textarea
                  {...register('address')}
                  className={inputClass}
                  rows={3}
                  placeholder="آدرس کامل مرکز..."
                />
              </FormField>
            </div>

            {/* is_active */}
            <FormField label="فعال" error={errors.is_active?.message}>
              <label className="inline-flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">مرکز فعال است</span>
              </label>
            </FormField>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSaving}>
            ذخیره
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/centers')}>
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
