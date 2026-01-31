import { useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
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

import { invoicesApi } from '../../api/invoices';
import { formatNumber } from '../../utils/format';

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------
const invoiceItemSchema = z.object({
  item_id: z.string().min(1, 'آیتم الزامی است'),
  quantity: z.string().min(1, 'تعداد الزامی است'),
  unit_price: z.string().min(1, 'قیمت واحد الزامی است'),
  description: z.string().optional(),
});

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, 'شماره صورتحساب الزامی است'),
  employee_id: z.string().min(1, 'بیمه‌شده الزامی است'),
  center_id: z.string().optional(),
  invoice_date: z.string().min(1, 'تاریخ صورتحساب الزامی است'),
  claim_id: z.string().optional(),
  status: z.string().optional(),
  items: z.array(invoiceItemSchema).optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// ---------------------------------------------------------------------------
// Row total helper
// ---------------------------------------------------------------------------
function ItemRowTotal({ control, index }: { control: any; index: number }) {
  const quantity = useWatch({ control, name: `items.${index}.quantity` });
  const unitPrice = useWatch({ control, name: `items.${index}.unit_price` });

  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  const total = qty * price;

  return (
    <span className="text-sm text-gray-700 font-medium" dir="ltr">
      {total > 0 ? formatNumber(total) : '-'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function InvoiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: invoice,
    isLoading: invoiceLoading,
    isError,
  } = useQuery({
    queryKey: ['invoice', numericId],
    queryFn: () => invoicesApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: '',
      employee_id: '',
      center_id: '',
      invoice_date: '',
      claim_id: '',
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
    if (invoice) {
      reset({
        invoice_number: invoice.invoice_number || '',
        employee_id: invoice.employee_id != null ? String(invoice.employee_id) : '',
        center_id: invoice.center_id != null ? String(invoice.center_id) : '',
        invoice_date: invoice.invoice_date || '',
        claim_id: invoice.claim_id != null ? String(invoice.claim_id) : '',
        status: invoice.status || '',
        items: (invoice.items || []).map((item) => ({
          item_id: String(item.item_id),
          quantity: String(item.quantity),
          unit_price: String(item.unit_price),
          description: item.description || '',
        })),
      });
    }
  }, [invoice, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => invoicesApi.create(data),
    onSuccess: () => {
      toast.success('صورتحساب با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
    onError: () => {
      toast.error('خطا در ایجاد صورتحساب');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => invoicesApi.update(numericId, data),
    onSuccess: () => {
      toast.success('صورتحساب با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
    onError: () => {
      toast.error('خطا در ویرایش صورتحساب');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: InvoiceFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'employee_id' || key === 'center_id' || key === 'claim_id') {
        payload[key] = Number(value);
      } else if (key === 'items') {
        payload[key] = (value as InvoiceFormValues['items'])?.map((item) => ({
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: Number(item.quantity) * Number(item.unit_price),
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
  if (isEditing && invoiceLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !invoice)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">صورتحساب مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/invoices')}>
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
          {isEditing ? 'ویرایش صورتحساب' : 'ایجاد صورتحساب'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header fields */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* invoice_number */}
            <FormField label="شماره صورتحساب" required error={errors.invoice_number?.message}>
              <input {...register('invoice_number')} className={inputClass} placeholder="شماره صورتحساب" />
            </FormField>

            {/* employee_id */}
            <FormField label="شناسه بیمه‌شده" required error={errors.employee_id?.message}>
              <input {...register('employee_id')} className={inputClass} placeholder="شناسه بیمه‌شده" dir="ltr" />
            </FormField>

            {/* center_id */}
            <FormField label="شناسه مرکز درمانی" error={errors.center_id?.message}>
              <input {...register('center_id')} className={inputClass} placeholder="شناسه مرکز" dir="ltr" />
            </FormField>

            {/* invoice_date */}
            <FormField label="تاریخ صورتحساب" required error={errors.invoice_date?.message}>
              <Controller
                name="invoice_date"
                control={control}
                render={({ field }) => (
                  <DatePicker value={field.value || ''} onChange={field.onChange} />
                )}
              />
            </FormField>

            {/* claim_id */}
            <FormField label="شناسه پرونده" error={errors.claim_id?.message}>
              <input {...register('claim_id')} className={inputClass} placeholder="شناسه پرونده" dir="ltr" />
            </FormField>

            {/* status */}
            <FormField label="وضعیت" error={errors.status?.message}>
              <SelectField
                options={[
                  { value: 'draft', label: 'پیش‌نویس' },
                  { value: 'pending', label: 'در انتظار بررسی' },
                  { value: 'calculated', label: 'محاسبه شده' },
                  { value: 'approved', label: 'تایید شده' },
                  { value: 'rejected', label: 'رد شده' },
                  { value: 'submitted', label: 'ثبت نهایی' },
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
            <h2 className="text-base font-bold text-gray-800">اقلام صورتحساب</h2>
            <Button
              type="button"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => append({ item_id: '', quantity: '1', unit_price: '', description: '' })}
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
                    <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-40">قیمت واحد (ریال)</th>
                    <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-36">قیمت کل</th>
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
                          {...register(`items.${index}.unit_price`)}
                          type="number"
                          min="0"
                          className={inputClass}
                          placeholder="قیمت واحد"
                          dir="ltr"
                        />
                        {errors.items?.[index]?.unit_price && (
                          <p className="text-xs text-danger mt-1">{errors.items[index]?.unit_price?.message}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <ItemRowTotal control={control} index={index} />
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
          <Button type="button" variant="secondary" onClick={() => navigate('/invoices')}>
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
