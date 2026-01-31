import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PencilIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import FormField from '../../components/ui/FormField';

import { centersApi } from '../../api/centers';
import { formatDate } from '../../utils/format';
import type { Center, CenterDoctor, CenterContract } from '../../types/center';

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-40 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value || '-'}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
type TabKey = 'info' | 'doctors' | 'contracts';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'اطلاعات پایه' },
  { key: 'doctors', label: 'پزشکان' },
  { key: 'contracts', label: 'قراردادها' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CenterViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericId = Number(id);

  // ---- Local state --------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [doctorModal, setDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<CenterDoctor | null>(null);
  const [deleteDoctorTarget, setDeleteDoctorTarget] = useState<number | null>(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    medical_code: '',
    specialty: '',
    is_active: true,
  });

  // ---- Fetch center data --------------------------------------------------
  const {
    data: center,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['center', numericId],
    queryFn: () => centersApi.get(numericId),
    enabled: !!numericId,
  });

  // ---- Doctor mutations ---------------------------------------------------
  const addDoctorMutation = useMutation({
    mutationFn: (data: Partial<CenterDoctor>) => centersApi.addDoctor(numericId, data),
    onSuccess: () => {
      toast.success('پزشک با موفقیت اضافه شد');
      queryClient.invalidateQueries({ queryKey: ['center', numericId] });
      closeDoctorModal();
    },
    onError: () => {
      toast.error('خطا در افزودن پزشک');
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: number; data: Partial<CenterDoctor> }) =>
      centersApi.updateDoctor(numericId, doctorId, data),
    onSuccess: () => {
      toast.success('اطلاعات پزشک با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['center', numericId] });
      closeDoctorModal();
    },
    onError: () => {
      toast.error('خطا در ویرایش اطلاعات پزشک');
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: (doctorId: number) => centersApi.deleteDoctor(numericId, doctorId),
    onSuccess: () => {
      toast.success('پزشک با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['center', numericId] });
      setDeleteDoctorTarget(null);
    },
    onError: () => {
      toast.error('خطا در حذف پزشک');
    },
  });

  // ---- Doctor modal helpers -----------------------------------------------
  const openAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm({ name: '', medical_code: '', specialty: '', is_active: true });
    setDoctorModal(true);
  };

  const openEditDoctor = (doctor: CenterDoctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      name: doctor.name || '',
      medical_code: doctor.medical_code || '',
      specialty: doctor.specialty || '',
      is_active: doctor.is_active ?? true,
    });
    setDoctorModal(true);
  };

  const closeDoctorModal = () => {
    setDoctorModal(false);
    setEditingDoctor(null);
    setDoctorForm({ name: '', medical_code: '', specialty: '', is_active: true });
  };

  const handleDoctorSubmit = () => {
    if (!doctorForm.name.trim()) {
      toast.error('نام پزشک الزامی است');
      return;
    }
    if (editingDoctor) {
      updateDoctorMutation.mutate({ doctorId: editingDoctor.id, data: doctorForm });
    } else {
      addDoctorMutation.mutate(doctorForm);
    }
  };

  const isDoctorSaving = addDoctorMutation.isPending || updateDoctorMutation.isPending;

  // ---- Doctor columns -----------------------------------------------------
  const doctorColumns = useMemo<Column<CenterDoctor & Record<string, unknown>>[]>(
    () => [
      { key: 'name', title: 'نام پزشک' },
      { key: 'medical_code', title: 'کد نظام پزشکی' },
      { key: 'specialty', title: 'تخصص' },
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

  const renderDoctorActions = useCallback(
    (row: CenterDoctor & Record<string, unknown>) => (
      <>
        <button
          onClick={() => openEditDoctor(row as CenterDoctor)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
          title="ویرایش"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDeleteDoctorTarget(row.id as number)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-danger transition-colors"
          title="حذف"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ---- Contract columns ---------------------------------------------------
  const contractColumns = useMemo<Column<CenterContract & Record<string, unknown>>[]>(
    () => [
      { key: 'contract_number', title: 'شماره قرارداد' },
      {
        key: 'start_date',
        title: 'تاریخ شروع',
        render: (row) => formatDate(row.start_date as string),
      },
      {
        key: 'end_date',
        title: 'تاریخ پایان',
        render: (row) => formatDate(row.end_date as string),
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

  // ---- Loading / Error states ---------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !center) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">مرکز درمانی مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/centers')}>
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  // ---- Derived data -------------------------------------------------------
  const doctors: CenterDoctor[] = center.doctors || [];
  const contracts: CenterContract[] = center.contracts || [];

  // ---- Input class --------------------------------------------------------
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary';

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{center.name}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => navigate(`/centers/${numericId}/edit`)}
          >
            ویرایش
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRightIcon className="w-4 h-4" />}
            onClick={() => navigate('/centers')}
          >
            بازگشت
          </Button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Header info card                                                  */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <span className="text-xs text-gray-500">کد مرکز</span>
            <p className="text-sm font-medium text-gray-800">{center.code || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">نوع مرکز</span>
            <p className="text-sm font-medium text-gray-800">{center.center_type_title || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">تخصص</span>
            <p className="text-sm font-medium text-gray-800">{center.specialty_title || '-'}</p>
          </div>
          <div>
            <StatusBadge
              status={center.is_active ? 'active' : 'inactive'}
              label={center.is_active ? 'فعال' : 'غیرفعال'}
            />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Tabs                                                              */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab headers */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* ----- Info Tab -------------------------------------------------- */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <DetailRow label="نام مرکز" value={center.name} />
              <DetailRow label="کد مرکز" value={center.code} />
              <DetailRow label="نوع مرکز" value={center.center_type_title} />
              <DetailRow label="تخصص" value={center.specialty_title} />
              <DetailRow label="استان" value={center.province_title} />
              <DetailRow label="شهر" value={center.city_title} />
              <DetailRow label="تلفن" value={center.phone} />
              <DetailRow label="فکس" value={center.fax} />
              <DetailRow label="نام مدیر" value={center.manager_name} />
              <DetailRow label="شماره مجوز" value={center.license_number} />
              <DetailRow
                label="وضعیت"
                value={
                  <StatusBadge
                    status={center.is_active ? 'active' : 'inactive'}
                    label={center.is_active ? 'فعال' : 'غیرفعال'}
                  />
                }
              />
              {center.address && (
                <div className="md:col-span-2">
                  <DetailRow label="آدرس" value={center.address} />
                </div>
              )}
            </div>
          )}

          {/* ----- Doctors Tab ------------------------------------------------ */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">لیست پزشکان</h3>
                <Button
                  size="sm"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={openAddDoctor}
                >
                  افزودن پزشک
                </Button>
              </div>
              <DataTable<CenterDoctor & Record<string, unknown>>
                columns={doctorColumns}
                data={doctors as (CenterDoctor & Record<string, unknown>)[]}
                keyField="id"
                actions={renderDoctorActions}
              />
            </div>
          )}

          {/* ----- Contracts Tab ---------------------------------------------- */}
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">لیست قراردادها</h3>
              <DataTable<CenterContract & Record<string, unknown>>
                columns={contractColumns}
                data={contracts as (CenterContract & Record<string, unknown>)[]}
                keyField="id"
              />
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Doctor add/edit modal                                             */}
      {/* ================================================================= */}
      <Modal
        open={doctorModal}
        onClose={closeDoctorModal}
        title={editingDoctor ? 'ویرایش پزشک' : 'افزودن پزشک'}
        size="sm"
      >
        <div className="space-y-4">
          <FormField label="نام پزشک" required>
            <input
              value={doctorForm.name}
              onChange={(e) => setDoctorForm((prev) => ({ ...prev, name: e.target.value }))}
              className={inputClass}
              placeholder="نام و نام خانوادگی پزشک"
            />
          </FormField>

          <FormField label="کد نظام پزشکی">
            <input
              value={doctorForm.medical_code}
              onChange={(e) => setDoctorForm((prev) => ({ ...prev, medical_code: e.target.value }))}
              className={inputClass}
              placeholder="کد نظام پزشکی"
              dir="ltr"
            />
          </FormField>

          <FormField label="تخصص">
            <input
              value={doctorForm.specialty}
              onChange={(e) => setDoctorForm((prev) => ({ ...prev, specialty: e.target.value }))}
              className={inputClass}
              placeholder="تخصص پزشک"
            />
          </FormField>

          <FormField label="فعال">
            <label className="inline-flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doctorForm.is_active}
                onChange={(e) =>
                  setDoctorForm((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">پزشک فعال است</span>
            </label>
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={closeDoctorModal}>
              انصراف
            </Button>
            <Button size="sm" onClick={handleDoctorSubmit} loading={isDoctorSaving}>
              {editingDoctor ? 'ویرایش' : 'افزودن'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================================================================= */}
      {/* Delete doctor confirm dialog                                      */}
      {/* ================================================================= */}
      <ConfirmDialog
        open={deleteDoctorTarget !== null}
        onClose={() => setDeleteDoctorTarget(null)}
        onConfirm={() =>
          deleteDoctorTarget !== null && deleteDoctorMutation.mutate(deleteDoctorTarget)
        }
        title="تایید حذف پزشک"
        message="آیا از حذف این پزشک اطمینان دارید؟"
        confirmLabel="حذف"
        loading={deleteDoctorMutation.isPending}
      />
    </div>
  );
}
