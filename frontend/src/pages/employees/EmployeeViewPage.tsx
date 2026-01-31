import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

import { employeesApi } from '../../api/employees';
import { formatDate } from '../../utils/format';
import type { Employee, EmployeeFamily } from '../../types/employee';

// ---------------------------------------------------------------------------
// Tabs configuration
// ---------------------------------------------------------------------------
const TABS = [
  { key: 'basic', label: 'اطلاعات پایه' },
  { key: 'family', label: 'خانواده' },
  { key: 'insurance', label: 'بیمه' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-36 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value || '-'}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EmployeeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericId = Number(id);

  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ---- Fetch employee data ------------------------------------------------
  const {
    data: employee,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['employee', numericId],
    queryFn: () => employeesApi.get(numericId),
    enabled: !!numericId,
  });

  // ---- Fetch family data (when tab is active) -----------------------------
  const { data: familyData, isLoading: familyLoading } = useQuery({
    queryKey: ['employee-family', numericId],
    queryFn: () => employeesApi.family(numericId),
    enabled: !!numericId && activeTab === 'family',
  });

  // ---- Delete mutation ----------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: () => employeesApi.delete(numericId),
    onSuccess: () => {
      toast.success('پرسنل با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
    onError: () => {
      toast.error('خطا در حذف پرسنل');
    },
  });

  // ---- Loading / Error states ---------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">پرسنل مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/employees')}>
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  // ---- Helper: boolean display --------------------------------------------
  const boolLabel = (v: boolean | undefined) => (v ? 'بله' : 'خیر');

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          مشاهده پرسنل: {employee.first_name} {employee.last_name}
        </h1>

        <div className="flex items-center gap-2">
          <Link to={`/employees/${numericId}/edit`}>
            <Button variant="primary" size="sm" icon={<PencilIcon className="w-4 h-4" />}>
              ویرایش
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={() => setDeleteOpen(true)}
          >
            حذف
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRightIcon className="w-4 h-4" />}
            onClick={() => navigate('/employees')}
          >
            بازگشت
          </Button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Photo + summary header */}
        <div className="flex items-center gap-5 p-6 border-b border-gray-100">
          {employee.photo ? (
            <img
              src={employee.photo}
              alt={`${employee.first_name} ${employee.last_name}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold border-2 border-gray-200">
              {employee.first_name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {employee.first_name} {employee.last_name}
            </h2>
            {employee.personnel_code && (
              <p className="text-sm text-gray-500 mt-0.5">
                کد پرسنلی: {employee.personnel_code}
              </p>
            )}
            <div className="mt-2">
              <StatusBadge
                status={employee.status?.value || 'unknown'}
                label={employee.status?.label}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-0 px-6" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <DetailRow label="کد پرسنلی" value={employee.personnel_code} />
              <DetailRow label="کد ملی" value={employee.national_code} />
              <DetailRow label="نام" value={employee.first_name} />
              <DetailRow label="نام خانوادگی" value={employee.last_name} />
              <DetailRow label="نام پدر" value={employee.father_name} />
              <DetailRow label="شماره شناسنامه" value={employee.id_number} />
              <DetailRow label="جنسیت" value={employee.gender?.label} />
              <DetailRow label="وضعیت تاهل" value={employee.marriage_status?.title} />
              <DetailRow label="تلفن" value={employee.phone} />
              <DetailRow label="موبایل" value={employee.mobile} />
              <DetailRow label="ایمیل" value={employee.email} />
              <DetailRow label="شماره حساب" value={employee.bank_account_number} />
              <DetailRow
                label="کد CEC"
                value={
                  employee.custom_employee_code
                    ? `${employee.custom_employee_code.code} - ${employee.custom_employee_code.title}`
                    : undefined
                }
              />
              <DetailRow label="نوع خاص" value={employee.special_employee_type?.title} />
              <DetailRow label="نسبت" value={employee.relation_type?.title} />
              <DetailRow label="نوع سرپرستی" value={employee.guardianship_type?.title} />
              <DetailRow
                label="پرسنل سرپرست"
                value={employee.parent?.full_name}
              />
              <DetailRow label="محل خدمت" value={employee.location?.name} />
              <DetailRow label="محل کار" value={employee.location_work?.name} />
              <DetailRow label="شعبه" value={employee.branch_id} />
              <DetailRow label="آدرس" value={employee.address} />
              <DetailRow label="اولویت" value={employee.priority} />
              <DetailRow label="توضیحات" value={employee.description} />
              <DetailRow label="تاریخ تولد" value={formatDate(employee.birth_date)} />
              <DetailRow label="تاریخ استخدام" value={formatDate(employee.employment_date)} />
              <DetailRow label="فعال" value={boolLabel(employee.is_active)} />
              <DetailRow
                label="وضعیت"
                value={
                  <StatusBadge
                    status={employee.status?.value || 'unknown'}
                    label={employee.status?.label}
                  />
                }
              />
              <DetailRow label="تاریخ ایجاد" value={formatDate(employee.created_at)} />
              <DetailRow label="آخرین بروزرسانی" value={formatDate(employee.updated_at)} />
            </div>
          )}

          {activeTab === 'family' && (
            <FamilyTab
              familyData={familyData ?? []}
              loading={familyLoading}
              employeeId={numericId}
            />
          )}

          {activeTab === 'insurance' && (
            <InsuranceTab employee={employee} />
          )}
        </div>
      </div>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="تایید حذف"
        message={`آیا از حذف پرسنل «${employee.first_name} ${employee.last_name}» اطمینان دارید؟`}
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Family tab sub-component
// ---------------------------------------------------------------------------
function FamilyTab({
  familyData,
  loading,
  employeeId,
}: {
  familyData: EmployeeFamily[];
  loading: boolean;
  employeeId: number;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (familyData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm mb-3">هنوز عضو خانواده‌ای ثبت نشده است.</p>
        <Link to={`/employees/${employeeId}/family`}>
          <Button variant="secondary" size="sm">مدیریت خانواده</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{familyData.length} عضو خانواده</p>
        <Link to={`/employees/${employeeId}/family`}>
          <Button variant="secondary" size="sm">مدیریت خانواده</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-right py-2 px-3 font-medium text-gray-600">نام</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">نام خانوادگی</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">کد ملی</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">نسبت</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">جنسیت</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">تاریخ تولد</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {familyData.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="py-2 px-3">{f.first_name}</td>
                <td className="py-2 px-3">{f.last_name}</td>
                <td className="py-2 px-3" dir="ltr">{f.national_code}</td>
                <td className="py-2 px-3">{f.relation_type?.title || '-'}</td>
                <td className="py-2 px-3">{f.gender?.label || '-'}</td>
                <td className="py-2 px-3">{formatDate(f.birth_date)}</td>
                <td className="py-2 px-3">
                  <StatusBadge status={f.is_active ? 'active' : 'inactive'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insurance tab sub-component
// ---------------------------------------------------------------------------
function InsuranceTab({ employee }: { employee: Employee }) {
  if (!employee.active_insurance) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        اطلاعات بیمه‌ای برای این پرسنل ثبت نشده است.
      </div>
    );
  }

  const ins = employee.active_insurance;
  return (
    <div className="max-w-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">بیمه فعال</h3>
      <div className="space-y-0 divide-y divide-gray-100">
        <DetailRow label="شماره بیمه" value={ins.insurance_number} />
        <DetailRow label="وضعیت" value={<StatusBadge status={ins.status} />} />
        <DetailRow
          label="سقف سالانه"
          value={ins.annual_ceiling?.toLocaleString('fa-IR')}
        />
        <DetailRow
          label="مانده"
          value={ins.remaining_amount?.toLocaleString('fa-IR')}
        />
      </div>
    </div>
  );
}
