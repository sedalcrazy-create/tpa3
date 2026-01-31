import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import FormField from '../../components/ui/FormField';
import SelectField from '../../components/ui/SelectField';
import DatePicker from '../../components/ui/DatePicker';
import FileUpload from '../../components/ui/FileUpload';
import Button from '../../components/ui/Button';

import {
  useSpecialEmployeeTypes,
  useRelationTypes,
  useGuardianshipTypes,
  useGenders,
  useEmployeeStatuses,
  useCustomEmployeeCodes,
  useMarriageStatuses,
  useAllLocations,
} from '../../hooks/useLookups';
import { employeesApi } from '../../api/employees';

const employeeSchema = z.object({
  custom_employee_code_id: z.string().optional(),
  special_employee_type_id: z.string().optional(),
  parent_id: z.string().optional(),
  first_name: z.string().min(1, 'نام الزامی است'),
  last_name: z.string().min(1, 'نام خانوادگی الزامی است'),
  father_name: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  personnel_code: z.string().optional(),
  bank_account_number: z.string().optional(),
  id_number: z.string().optional(),
  email: z.string().optional().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'ایمیل نامعتبر است'),
  address: z.string().optional(),
  photo: z.instanceof(File).nullable().optional(),
  relation_type_id: z.string().optional(),
  national_code: z.string().min(1, 'کد ملی الزامی است').regex(/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد'),
  gender: z.string().optional(),
  guardianship_type_id: z.string().optional(),
  marriage_status_id: z.string().optional(),
  location_id: z.string().optional(),
  location_work_id: z.string().optional(),
  birth_date: z.string().optional(),
  employment_date: z.string().optional(),
  branch_id: z.string().optional(),
  priority: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  status: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function EmployeeCreatePage() {
  const navigate = useNavigate();

  const { data: specialTypes = [], isLoading: specialTypesLoading } = useSpecialEmployeeTypes();
  const { data: relationTypes = [], isLoading: relationTypesLoading } = useRelationTypes();
  const { data: guardianshipTypes = [], isLoading: guardianshipTypesLoading } = useGuardianshipTypes();
  const { data: genders = [], isLoading: gendersLoading } = useGenders();
  const { data: employeeStatuses = [], isLoading: statusesLoading } = useEmployeeStatuses();
  const { data: customEmployeeCodes = [], isLoading: cecLoading } = useCustomEmployeeCodes();
  const { data: marriageStatuses = [], isLoading: marriageStatusesLoading } = useMarriageStatuses();
  const { data: locations = [], isLoading: locationsLoading } = useAllLocations();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      custom_employee_code_id: '',
      special_employee_type_id: '',
      parent_id: '',
      first_name: '',
      last_name: '',
      father_name: '',
      phone: '',
      mobile: '',
      personnel_code: '',
      bank_account_number: '',
      id_number: '',
      email: '',
      address: '',
      photo: null,
      relation_type_id: '',
      national_code: '',
      gender: '',
      guardianship_type_id: '',
      marriage_status_id: '',
      location_id: '',
      location_work_id: '',
      birth_date: '',
      employment_date: '',
      branch_id: '',
      priority: '',
      description: '',
      is_active: true,
      status: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => employeesApi.create(formData),
    onSuccess: () => {
      toast.success('پرسنل با موفقیت ایجاد شد');
      navigate('/employees');
    },
    onError: () => {
      toast.error('خطا در ایجاد پرسنل');
    },
  });

  const onSubmit = (values: EmployeeFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'photo') {
        if (value instanceof File) formData.append('photo', value);
        return;
      }
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
      }
    });
    createMutation.mutate(formData);
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">افزودن پرسنل جدید</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <FormField label="کد پرسنلی" error={errors.personnel_code?.message}>
            <input {...register('personnel_code')} className={inputClass} />
          </FormField>

          <FormField label="ڪد ملی" required error={errors.national_code?.message}>
            <input {...register('national_code')} className={inputClass} />
          </FormField>

          <FormField label="نام" required error={errors.first_name?.message}>
            <input {...register('first_name')} className={inputClass} />
          </FormField>

          <FormField label="نام خانوادگی" required error={errors.last_name?.message}>
            <input {...register('last_name')} className={inputClass} />
          </FormField>

          <FormField label="نام پدر" error={errors.father_name?.message}>
            <input {...register('father_name')} className={inputClass} />
          </FormField>

          <FormField label="شماره شناسنامه" error={errors.id_number?.message}>
            <input {...register('id_number')} className={inputClass} />
          </FormField>

          <FormField label="جنسیت" error={errors.gender?.message}>
            <SelectField options={genders} loading={gendersLoading} {...register('gender')} />
          </FormField>

          <FormField label="وضعیت تاهل" error={errors.marriage_status_id?.message}>
            <SelectField options={marriageStatuses} loading={marriageStatusesLoading} {...register('marriage_status_id')} />
          </FormField>

          <FormField label="کد کارمندی (CEC)" error={errors.custom_employee_code_id?.message}>
            <SelectField options={customEmployeeCodes} loading={cecLoading} {...register('custom_employee_code_id')} />
          </FormField>

          <FormField label="نوع خاص" error={errors.special_employee_type_id?.message}>
            <SelectField options={specialTypes} loading={specialTypesLoading} {...register('special_employee_type_id')} />
          </FormField>

          <FormField label="نسبت" error={errors.relation_type_id?.message}>
            <SelectField options={relationTypes} loading={relationTypesLoading} {...register('relation_type_id')} />
          </FormField>

          <FormField label="نوع سرپرستی" error={errors.guardianship_type_id?.message}>
            <SelectField options={guardianshipTypes} loading={guardianshipTypesLoading} {...register('guardianship_type_id')} />
          </FormField>

          <FormField label="شناسه سرپرست" error={errors.parent_id?.message}>
            <input {...register('parent_id')} className={inputClass} placeholder="شناسه پرسنل سرپرست" />
          </FormField>

          <FormField label="تلفن" error={errors.phone?.message}>
            <input {...register('phone')} className={inputClass} dir="ltr" />
          </FormField>

          <FormField label="موبایل" error={errors.mobile?.message}>
            <input {...register('mobile')} className={inputClass} dir="ltr" />
          </FormField>

          <FormField label="ایمیل" error={errors.email?.message}>
            <input {...register('email')} type="email" className={inputClass} dir="ltr" />
          </FormField>

          <FormField label="شماره حساب" error={errors.bank_account_number?.message}>
            <input {...register('bank_account_number')} className={inputClass} dir="ltr" />
          </FormField>

          <FormField label="محل خدمت" error={errors.location_id?.message}>
            <SelectField options={locations} loading={locationsLoading} {...register('location_id')} />
          </FormField>

          <FormField label="محل کار" error={errors.location_work_id?.message}>
            <SelectField options={locations} loading={locationsLoading} {...register('location_work_id')} />
          </FormField>

          <FormField label="شعبه" error={errors.branch_id?.message}>
            <input {...register('branch_id')} className={inputClass} />
          </FormField>

          <FormField label="اولویت" error={errors.priority?.message}>
            <input {...register('priority')} type="number" className={inputClass} />
          </FormField>

          <FormField label="آدرس" error={errors.address?.message}>
            <input {...register('address')} className={inputClass} />
          </FormField>

          <FormField label="توضیحات" error={errors.description?.message}>
            <input {...register('description')} className={inputClass} />
          </FormField>

          <FormField label="تاریخ تولد" error={errors.birth_date?.message}>
            <Controller
              name="birth_date"
              control={control}
              render={({ field }) => <DatePicker value={field.value || ''} onChange={field.onChange} />}
            />
          </FormField>

          <FormField label="تاریخ استخدام" error={errors.employment_date?.message}>
            <Controller
              name="employment_date"
              control={control}
              render={({ field }) => <DatePicker value={field.value || ''} onChange={field.onChange} />}
            />
          </FormField>

          <FormField label="تصویر" error={errors.photo?.message as string | undefined}>
            <Controller
              name="photo"
              control={control}
              render={({ field }) => <FileUpload value={field.value} onChange={field.onChange} accept="image/*" />}
            />
          </FormField>

          <FormField label="وضعیت" error={errors.status?.message}>
            <SelectField options={employeeStatuses} loading={statusesLoading} {...register('status')} />
          </FormField>

          <FormField label="فعال" error={errors.is_active?.message}>
            <label className="inline-flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">پرسنل فعال است</span>
            </label>
          </FormField>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button type="submit" loading={createMutation.isPending}>ذخیره</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/employees')}>انصراف</Button>
        </div>
      </form>
    </div>
  );
}
