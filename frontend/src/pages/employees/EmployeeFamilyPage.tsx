import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { employeesApi } from '../../api/employees';
import { useRelationTypes } from '../../hooks/useLookups';
import DataTable, { type Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import SelectField from '../../components/ui/SelectField';
import DatePicker from '../../components/ui/DatePicker';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/format';
import type { EmployeeFamily } from '../../types/employee';
import { GENDER_OPTIONS } from '../../utils/constants';

export default function EmployeeFamilyPage() {
  const { id } = useParams();
  const employeeId = Number(id);
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<EmployeeFamily | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [relationTypeId, setRelationTypeId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: relationTypes = [] } = useRelationTypes();

  const { data: employee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeesApi.get(employeeId),
  });

  const { data: familyData, isLoading } = useQuery({
    queryKey: ['employee-family', employeeId],
    queryFn: () => employeesApi.family(employeeId),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editingFamily
        ? employeesApi.updateFamily(employeeId, editingFamily.id, data as Partial<EmployeeFamily>)
        : employeesApi.addFamily(employeeId, data as Partial<EmployeeFamily>),
    onSuccess: () => {
      toast.success(editingFamily ? 'ویرایش با موفقیت انجام شد' : 'افزوده شد');
      queryClient.invalidateQueries({ queryKey: ['employee-family', employeeId] });
      closeModal();
    },
    onError: () => toast.error('خطا در ذخیره اطلاعات'),
  });

  const deleteMutation = useMutation({
    mutationFn: (familyId: number) => employeesApi.deleteFamily(employeeId, familyId),
    onSuccess: () => {
      toast.success('حذف با موفقیت انجام شد');
      queryClient.invalidateQueries({ queryKey: ['employee-family', employeeId] });
      setDeleteId(null);
    },
    onError: () => toast.error('خطا در حذف'),
  });

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setNationalCode('');
    setRelationTypeId('');
    setBirthDate('');
    setGender('');
    setIsActive(true);
  };

  const openCreate = () => {
    resetForm();
    setEditingFamily(null);
    setModalOpen(true);
  };

  const openEdit = (f: EmployeeFamily) => {
    setEditingFamily(f);
    setFirstName(f.first_name);
    setLastName(f.last_name);
    setNationalCode(f.national_code);
    setRelationTypeId(f.relation_type?.id != null ? String(f.relation_type.id) : '');
    setBirthDate(f.birth_date || '');
    setGender(f.gender?.value || '');
    setIsActive(f.is_active);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFamily(null);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !nationalCode) {
      toast.error('لطفاً فیلدهای الزامی را پر کنید');
      return;
    }
    saveMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      national_code: nationalCode,
      relation_type_id: relationTypeId ? Number(relationTypeId) : undefined,
      birth_date: birthDate || undefined,
      gender,
      is_active: isActive,
    });
  };

  const columns: Column<EmployeeFamily & Record<string, unknown>>[] = [
    { key: 'id', title: 'ردیف', width: '60px' },
    { key: 'first_name', title: 'نام' },
    { key: 'last_name', title: 'نام خانوادگی' },
    { key: 'national_code', title: 'کد ملی' },
    {
      key: 'relation_type',
      title: 'نسبت',
      render: (r) => (r as unknown as EmployeeFamily).relation_type?.title || '-',
    },
    {
      key: 'gender',
      title: 'جنسیت',
      render: (r) => (r as unknown as EmployeeFamily).gender?.label || '-',
    },
    {
      key: 'birth_date',
      title: 'تاریخ تولد',
      render: (r) => formatDate((r as unknown as EmployeeFamily).birth_date),
    },
    {
      key: 'is_active',
      title: 'وضعیت',
      render: (r) => <StatusBadge status={(r as unknown as EmployeeFamily).is_active ? 'active' : 'inactive'} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/employees" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">
            خانواده {employee ? `${employee.first_name} ${employee.last_name}` : ''}
          </h1>
        </div>
        <Button icon={<PlusIcon className="w-4 h-4" />} onClick={openCreate}>
          افزودن عضو خانواده
        </Button>
      </div>

      <DataTable<EmployeeFamily & Record<string, unknown>>
        columns={columns}
        data={(familyData as (EmployeeFamily & Record<string, unknown>)[]) || []}
        loading={isLoading}
        actions={(row) => (
          <>
            <button onClick={() => openEdit(row as unknown as EmployeeFamily)} className="p-1 hover:bg-blue-50 rounded text-blue-600">
              <PencilIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setDeleteId(row.id as number)} className="p-1 hover:bg-red-50 rounded text-red-600">
              <TrashIcon className="w-4 h-4" />
            </button>
          </>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingFamily ? 'ویرایش عضو خانواده' : 'افزودن عضو خانواده'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <FormField label="نام" required>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </FormField>
            <FormField label="نام خانوادگی" required>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </FormField>
            <FormField label="کد ملی" required>
              <input type="text" value={nationalCode} onChange={(e) => setNationalCode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" dir="ltr" />
            </FormField>
            <FormField label="نسبت">
              <SelectField options={relationTypes} value={relationTypeId} onChange={(e) => setRelationTypeId(e.target.value)} />
            </FormField>
            <FormField label="جنسیت">
              <SelectField options={GENDER_OPTIONS} value={gender} onChange={(e) => setGender(e.target.value)} />
            </FormField>
            <FormField label="تاریخ تولد">
              <DatePicker value={birthDate} onChange={setBirthDate} />
            </FormField>
            <FormField label="فعال">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-gray-300" />
            </FormField>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="submit" loading={saveMutation.isPending}>ذخیره</Button>
            <Button variant="secondary" type="button" onClick={closeModal}>انصراف</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
