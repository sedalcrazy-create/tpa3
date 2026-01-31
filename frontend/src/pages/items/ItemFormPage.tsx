import { useEffect } from 'react';
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

import { useItemCategories } from '../../hooks/useLookups';
import { itemsApi } from '../../api/items';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const itemSchema = z.object({
  code: z.string().min(1, 'کد آیتم الزامی است'),
  title: z.string().min(1, 'عنوان آیتم الزامی است'),
  generic_name: z.string().optional(),
  category_id: z.string().optional(),
  unit: z.string().optional(),
  is_active: z.boolean().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Lookups ------------------------------------------------------------
  const { data: itemCategories = [], isLoading: categoriesLoading } = useItemCategories();

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: item,
    isLoading: itemLoading,
    isError,
  } = useQuery({
    queryKey: ['item', numericId],
    queryFn: () => itemsApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      code: '',
      title: '',
      generic_name: '',
      category_id: '',
      unit: '',
      is_active: true,
    },
  });

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (item) {
      reset({
        code: item.code || '',
        title: item.title || '',
        generic_name: item.generic_name || '',
        category_id: item.category_id != null ? String(item.category_id) : '',
        unit: item.unit || '',
        is_active: item.is_active ?? true,
      });
    }
  }, [item, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => itemsApi.create(data),
    onSuccess: () => {
      toast.success('آیتم با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/items');
    },
    onError: () => {
      toast.error('خطا در ایجاد آیتم');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => itemsApi.update(numericId, data),
    onSuccess: () => {
      toast.success('آیتم با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/items');
    },
    onError: () => {
      toast.error('خطا در ویرایش آیتم');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: ItemFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'is_active') {
          payload[key] = value;
        } else if (key === 'category_id') {
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
  if (isEditing && itemLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !item)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">آیتم مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/items')}>
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
          {isEditing ? 'ویرایش آیتم' : 'ایجاد آیتم'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {/* code */}
          <FormField label="کد آیتم" required error={errors.code?.message}>
            <input {...register('code')} className={inputClass} placeholder="کد آیتم" />
          </FormField>

          {/* title */}
          <FormField label="عنوان" required error={errors.title?.message}>
            <input {...register('title')} className={inputClass} placeholder="عنوان آیتم" />
          </FormField>

          {/* generic_name */}
          <FormField label="نام ژنریک" error={errors.generic_name?.message}>
            <input {...register('generic_name')} className={inputClass} placeholder="نام ژنریک" />
          </FormField>

          {/* category_id */}
          <FormField label="دسته‌بندی" error={errors.category_id?.message}>
            <SelectField
              options={itemCategories}
              loading={categoriesLoading}
              placeholder="انتخاب دسته‌بندی..."
              {...register('category_id')}
            />
          </FormField>

          {/* unit */}
          <FormField label="واحد" error={errors.unit?.message}>
            <input {...register('unit')} className={inputClass} placeholder="واحد (مثلا: عدد، بسته)" />
          </FormField>

          {/* is_active */}
          <FormField label="فعال" error={errors.is_active?.message}>
            <label className="inline-flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">آیتم فعال است</span>
            </label>
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button type="submit" loading={isSaving}>
            ذخیره
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/items')}>
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
