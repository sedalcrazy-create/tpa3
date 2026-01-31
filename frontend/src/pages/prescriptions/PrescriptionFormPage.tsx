import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import FormField from '../../components/ui/FormField';
import SelectField from '../../components/ui/SelectField';
import DatePicker from '../../components/ui/DatePicker';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { prescriptionsApi } from '../../api/prescriptions';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const prescriptionItemSchema = z.object({
  item_id: z.string().min(1, 'آیتم الزامی است'),
  quantity: z.string().min(1, 'تعداد الزامی است'),
  dosage: z.string().optional(),
  description: z.string().optional(),
});

const prescriptionSchema = z.object({
  prescription_number: z.string().min(1, 'شماره نسخه الزامی است'),
  employee_id: z.string().min(1, 'بیمه‌شده الزامی است'),
  doctor_name: z.string().optional(),
  center_id: z.string().optional(),
  prescription_date: z.string().min(1, 'تاریخ نسخه الزامی است'),
  diagnosis_code: z.string().optional(),
  status: z.string().optional(),
  items: z.array(prescriptionItemSchema).optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PrescriptionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: prescription,
    isLoading: prescriptionLoading,
    isError,
  } = useQuery({
    queryKey: ['prescription', numericId],
    queryFn: () => prescriptionsApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      prescription_number: '',
      employee_id: '',
      doctor_name: '',
      center_id: '',
      prescription_date: '',
      diagnosis_code: '',
      status: '',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (prescription) {
      reset({
        prescription_number: prescription.prescription_number || '',
        employee_id: prescription.employee_id != null ? String(prescription.employee_id) : '',
        doctor_name: prescription.doctor_name || '',
        center_id: prescription.center_id != null ? String(prescription.center_id) : '',
        prescription_date: prescription.prescription_date || '',
        diagnosis_code: prescription.diagnosis_code || '',
        status: prescription.status || '',
        items: (prescription.items || []).map((item) => ({
          item_id: String(item.item_id),
          quantity: String(item.quantity),
          dosage: item.dosage || '',
          description: item.description || '',
        })),
      });
    }
  }, [prescription, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => prescriptionsApi.create(data),
    onSuccess: () => {
      toast.success('نسخه با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      navigate('/prescriptions');
    },
    onError: () => {
      toast.error('خطا در ایجاد نسخه');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => prescriptionsApi.update(numericId, data),
    onSuccess: () => {
      toast.success('نسخه با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      navigate('/prescriptions');
    },
    onError: () => {
      toast.error('خطا در ویرایش نسخه');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: PrescriptionFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'employee_id' || key === 'center_id') {
        payload[key] = Number(value);
      } else if (key === 'items') {
        payload[key] = (value as PrescriptionFormValues['items'])?.map((item) => ({
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          dosage: item.dosage || undefined,
          description: item.description || undefined,
        }));
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
  if (isEditing && prescriptionLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !prescription)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">نسخه مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/prescriptions')}>
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
          {isEditing ? 'ویرایش نسخه' : 'ایجاد نسخه'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header fields */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* prescription_number */}
            <FormField label="شماره نسخه" required error={errors.prescription_number?.message}>
              <input {...register('prescription_number')} className={inputClass} placeholder="شماره نسخه" />
            </FormField>

            {/* employee_id */}
            <FormField label="شناسه بیمه‌شده" required error={errors.employee_id?.message}>
              <input {...register('employee_id')} className={inputClass} placeholder="شناسه بیمه‌شده" dir="ltr" />
            </FormField>

            {/* doctor_name */}
            <FormField label="نام پزشک" error={errors.doctor_name?.message}>
              <input {...register('doctor_name')} className={inputClass} placeholder="نام پزشک" />
            </FormField>

            {/* center_id */}
            <FormField label="شناسه مرکز درمانی" error={errors.center_id?.message}>
              <input {...register('center_id')} className={inputClass} placeholder="شناسه مرکز" dir="ltr" />
            </FormField>

            {/* prescription_date */}
            <FormField label="تاریخ نسخه" required error={errors.prescription_date?.message}>
              <Controller
                name="prescription_date"
                control={control}
                render={({ field }) => (
                  <DatePicker value={field.value || ''} onChange={field.onChange} />
                )}
              />
            </FormField>

            {/* diagnosis_code */}
            <FormField label="کد تشخیص" error={errors.diagnosis_code?.message}>
              <input {...register('diagnosis_code')} className={inputClass} placeholder="کد تشخیص" dir="ltr" />
            </FormField>

            {/* status */}
            <FormField label="وضعیت" error={errors.status?.message}>
              <SelectField
                options={[
                  { value: 'draft', label: 'پیش‌نویس' },
                  { value: 'active', label: 'فعال' },
                  { value: 'used', label: 'استفاده شده' },
                  { value: 'expired', label: 'منقضی' },
                  { value: 'cancelled', label: 'لغو شده' },
                ]}
                placeholder="انتخاب وضعیت..."
                {...register('status')}
              />
            </FormField>
          </div>
        </div>

        {/* Items section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">اقلام نسخه</h2>
            <Button
              type="button"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => append({ item_id: '', quantity: '1', dosage: '', description: '' })}
            >
              افزودن ردیف
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">اقلامی اضافه نشده است.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-10">ردیف</th>
                    <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">شناسه آیتم</th>
                    <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-28">تعداد</th>
                    <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">دوز مصرف</th>
                    <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">توضیحات</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 w-16">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b border-gray-100">
                      <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          {...register(`items.${index}.item_id`)}
                          className={inputClass}
                          placeholder="شناسه آیتم"
                          dir="ltr"
                        />
                        {errors.items?.[index]?.item_id && (
                          <p className="text-xs text-danger mt-1">{errors.items[index]?.item_id?.message}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          {...register(`items.${index}.quantity`)}
                          type="number"
                          min="1"
                          className={inputClass}
                          placeholder="تعداد"
                          dir="ltr"
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="text-xs text-danger mt-1">{errors.items[index]?.quantity?.message}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          {...register(`items.${index}.dosage`)}
                          className={inputClass}
                          placeholder="دوز مصرف"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          {...register(`items.${index}.description`)}
                          className={inputClass}
                          placeholder="توضیحات"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-danger transition-colors"
                          title="حذف ردیف"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSaving}>
            ذخیره
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/prescriptions')}>
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
