import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import DatePicker from '../../components/ui/DatePicker';

import { itemsApi } from '../../api/items';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Item, ItemPrice } from '../../types/item';

// ---------------------------------------------------------------------------
// Zod validation schema for the price form
// ---------------------------------------------------------------------------
const priceSchema = z.object({
  price: z.string().min(1, 'مبلغ الزامی است'),
  insurance_share_percent: z.string().optional(),
  effective_date: z.string().min(1, 'تاریخ شروع الزامی است'),
  end_date: z.string().optional(),
  is_active: z.boolean().optional(),
});

type PriceFormValues = z.infer<typeof priceSchema>;

const defaultPriceValues: PriceFormValues = {
  price: '',
  insurance_share_percent: '',
  effective_date: '',
  end_date: '',
  is_active: true,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ItemPricePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericId = Number(id);

  // ---- Modal state --------------------------------------------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ItemPrice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // ---- Fetch item info ----------------------------------------------------
  const {
    data: item,
    isLoading: itemLoading,
    isError: itemError,
  } = useQuery({
    queryKey: ['item', numericId],
    queryFn: () => itemsApi.get(numericId),
    enabled: !!numericId,
  });

  // ---- Fetch prices -------------------------------------------------------
  const {
    data: prices = [],
    isLoading: pricesLoading,
  } = useQuery({
    queryKey: ['item-prices', numericId],
    queryFn: () => itemsApi.prices(numericId),
    enabled: !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PriceFormValues>({
    resolver: zodResolver(priceSchema),
    defaultValues: defaultPriceValues,
  });

  // ---- Open modal for create / edit --------------------------------------
  const openCreateModal = useCallback(() => {
    setEditingPrice(null);
    reset(defaultPriceValues);
    setModalOpen(true);
  }, [reset]);

  const openEditModal = useCallback(
    (price: ItemPrice) => {
      setEditingPrice(price);
      reset({
        price: price.price != null ? String(price.price) : '',
        insurance_share_percent:
          price.insurance_share_percent != null ? String(price.insurance_share_percent) : '',
        effective_date: price.effective_date || '',
        end_date: price.end_date || '',
        is_active: price.is_active ?? true,
      });
      setModalOpen(true);
    },
    [reset],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingPrice(null);
    reset(defaultPriceValues);
  }, [reset]);

  // ---- Mutations ----------------------------------------------------------
  const addPriceMutation = useMutation({
    mutationFn: (data: Partial<ItemPrice>) => itemsApi.addPrice(numericId, data),
    onSuccess: () => {
      toast.success('قیمت با موفقیت اضافه شد');
      queryClient.invalidateQueries({ queryKey: ['item-prices', numericId] });
      closeModal();
    },
    onError: () => {
      toast.error('خطا در افزودن قیمت');
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ priceId, data }: { priceId: number; data: Partial<ItemPrice> }) =>
      itemsApi.updatePrice(numericId, priceId, data),
    onSuccess: () => {
      toast.success('قیمت با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['item-prices', numericId] });
      closeModal();
    },
    onError: () => {
      toast.error('خطا در ویرایش قیمت');
    },
  });

  const deletePriceMutation = useMutation({
    mutationFn: (priceId: number) => itemsApi.deletePrice(numericId, priceId),
    onSuccess: () => {
      toast.success('قیمت با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['item-prices', numericId] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('خطا در حذف قیمت');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: PriceFormValues) => {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'is_active') {
          payload[key] = value;
        } else if (key === 'price' || key === 'insurance_share_percent') {
          payload[key] = Number(value);
        } else {
          payload[key] = value;
        }
      }
    });

    if (editingPrice) {
      updatePriceMutation.mutate({ priceId: editingPrice.id, data: payload as Partial<ItemPrice> });
    } else {
      addPriceMutation.mutate(payload as Partial<ItemPrice>);
    }
  };

  const isSaving = addPriceMutation.isPending || updatePriceMutation.isPending;

  // ---- Columns definition -------------------------------------------------
  const columns = useMemo<Column<ItemPrice & Record<string, unknown>>[]>(
    () => [
      {
        key: 'id',
        title: 'شناسه',
        width: '70px',
      },
      {
        key: 'price',
        title: 'مبلغ',
        render: (row) => formatCurrency(row.price),
      },
      {
        key: 'insurance_share_percent',
        title: 'سهم بیمه (%)',
        render: (row) =>
          row.insurance_share_percent != null ? `${row.insurance_share_percent}%` : '-',
      },
      {
        key: 'effective_date',
        title: 'تاریخ شروع',
        render: (row) => formatDate(row.effective_date),
      },
      {
        key: 'end_date',
        title: 'تاریخ پایان',
        render: (row) => formatDate(row.end_date),
      },
      {
        key: 'is_active',
        title: 'وضعیت',
        render: (row) => (
          <StatusBadge
            status={row.is_active ? 'active' : 'inactive'}
            label={row.is_active ? 'فعال' : 'غیرفعال'}
          />
        ),
      },
    ],
    [],
  );

  // ---- Action buttons per row ---------------------------------------------
  const renderActions = useCallback(
    (row: ItemPrice & Record<string, unknown>) => (
      <>
        <button
          onClick={() => openEditModal(row as ItemPrice)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
          title="ویرایش"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDeleteTarget(row.id as number)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-danger transition-colors"
          title="حذف"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </>
    ),
    [openEditModal],
  );

  // ---- Loading / Error states ---------------------------------------------
  if (itemLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (itemError || !item) {
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/items')}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
            title="بازگشت"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">مدیریت قیمت</h1>
        </div>
        <Button icon={<PlusIcon className="w-4 h-4" />} onClick={openCreateModal}>
          افزودن قیمت
        </Button>
      </div>

      {/* Item info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-6 text-sm text-gray-700">
          <div>
            <span className="font-semibold text-gray-500">کد:</span>{' '}
            <span>{item.code}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500">عنوان:</span>{' '}
            <span>{item.title}</span>
          </div>
        </div>
      </div>

      {/* Prices table */}
      <DataTable<ItemPrice & Record<string, unknown>>
        columns={columns}
        data={prices as (ItemPrice & Record<string, unknown>)[]}
        loading={pricesLoading}
        keyField="id"
        actions={renderActions}
      />

      {/* Price form modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingPrice ? 'ویرایش قیمت' : 'افزودن قیمت'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* price */}
          <FormField label="مبلغ (ریال)" required error={errors.price?.message}>
            <input
              {...register('price')}
              className={inputClass}
              dir="ltr"
              placeholder="مبلغ"
            />
          </FormField>

          {/* insurance_share_percent */}
          <FormField label="سهم بیمه (%)" error={errors.insurance_share_percent?.message}>
            <input
              {...register('insurance_share_percent')}
              className={inputClass}
              dir="ltr"
              placeholder="درصد سهم بیمه"
            />
          </FormField>

          {/* effective_date */}
          <FormField label="تاریخ شروع" required error={errors.effective_date?.message}>
            <Controller
              name="effective_date"
              control={control}
              render={({ field }) => (
                <DatePicker value={field.value || ''} onChange={field.onChange} />
              )}
            />
          </FormField>

          {/* end_date */}
          <FormField label="تاریخ پایان" error={errors.end_date?.message}>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <DatePicker value={field.value || ''} onChange={field.onChange} />
              )}
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
              <span className="text-sm text-gray-700">قیمت فعال است</span>
            </label>
          </FormField>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Button type="submit" loading={isSaving}>
              ذخیره
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>
              انصراف
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget !== null && deletePriceMutation.mutate(deleteTarget)}
        title="تایید حذف"
        message="آیا از حذف این قیمت اطمینان دارید؟"
        confirmLabel="حذف"
        loading={deletePriceMutation.isPending}
      />
    </div>
  );
}
