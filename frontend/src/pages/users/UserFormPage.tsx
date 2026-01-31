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

import { usersApi } from '../../api/users';

// ---------------------------------------------------------------------------
// Role options
// ---------------------------------------------------------------------------
const ROLE_OPTIONS = [
  { value: 'admin', label: 'مدیر سیستم' },
  { value: 'operator', label: 'اپراتور' },
  { value: 'viewer', label: 'مشاهده‌کننده' },
];

// ---------------------------------------------------------------------------
// Zod validation schema (dynamic: create vs edit)
// ---------------------------------------------------------------------------
const createSchema = z
  .object({
    name: z.string().min(1, 'نام الزامی است'),
    email: z.string().min(1, 'ایمیل الزامی است').email('فرمت ایمیل صحیح نیست'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    password_confirmation: z.string().min(1, 'تکرار رمز عبور الزامی است'),
    role: z.string().min(1, 'نقش الزامی است'),
    is_active: z.boolean().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'رمز عبور و تکرار آن مطابقت ندارند',
    path: ['password_confirmation'],
  });

const editSchema = z
  .object({
    name: z.string().min(1, 'نام الزامی است'),
    email: z.string().min(1, 'ایمیل الزامی است').email('فرمت ایمیل صحیح نیست'),
    password: z.string().optional().refine(
      (val) => !val || val.length >= 6,
      { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
    ),
    password_confirmation: z.string().optional(),
    role: z.string().min(1, 'نقش الزامی است'),
    is_active: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.password_confirmation;
      }
      return true;
    },
    {
      message: 'رمز عبور و تکرار آن مطابقت ندارند',
      path: ['password_confirmation'],
    },
  );

type UserFormValues = z.infer<typeof createSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Fetch existing data (edit mode) ------------------------------------
  const {
    data: user,
    isLoading: userLoading,
    isError,
  } = useQuery({
    queryKey: ['user', numericId],
    queryFn: () => usersApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Form ---------------------------------------------------------------
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? editSchema : createSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: '',
      is_active: true,
    },
  });

  // Pre-fill form when data loads (edit mode)
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || '',
        is_active: user.is_active ?? true,
      });
    }
  }, [user, reset]);

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.create(data as Parameters<typeof usersApi.create>[0]),
    onSuccess: () => {
      toast.success('کاربر با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
    onError: () => {
      toast.error('خطا در ایجاد کاربر');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      usersApi.update(numericId, data as Parameters<typeof usersApi.update>[1]),
    onSuccess: () => {
      toast.success('کاربر با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', numericId] });
      navigate('/users');
    },
    onError: () => {
      toast.error('خطا در ویرایش کاربر');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const onSubmit = (values: UserFormValues) => {
    const payload: Record<string, unknown> = {
      name: values.name,
      email: values.email,
      role: values.role,
      is_active: values.is_active ?? true,
    };

    // Only include password fields if a password was provided
    if (values.password && values.password.length > 0) {
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ---- Loading / Error states (edit mode) ---------------------------------
  if (isEditing && userLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (isError || !user)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">کاربر مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/users')}>
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
          {isEditing ? 'ویرایش کاربر' : 'ایجاد کاربر'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* name */}
            <FormField label="نام" required error={errors.name?.message}>
              <input
                {...register('name')}
                className={inputClass}
                placeholder="نام کاربر"
              />
            </FormField>

            {/* email */}
            <FormField label="ایمیل" required error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                className={inputClass}
                placeholder="example@email.com"
                dir="ltr"
              />
            </FormField>

            {/* password */}
            <FormField
              label="رمز عبور"
              required={!isEditing}
              error={errors.password?.message}
            >
              <input
                {...register('password')}
                type="password"
                className={inputClass}
                placeholder={isEditing ? 'در صورت تغییر وارد کنید...' : 'رمز عبور'}
                dir="ltr"
              />
            </FormField>

            {/* password_confirmation */}
            <FormField
              label="تکرار رمز عبور"
              required={!isEditing}
              error={errors.password_confirmation?.message}
            >
              <input
                {...register('password_confirmation')}
                type="password"
                className={inputClass}
                placeholder="تکرار رمز عبور"
                dir="ltr"
              />
            </FormField>

            {/* role */}
            <FormField label="نقش" required error={errors.role?.message}>
              <SelectField
                options={ROLE_OPTIONS}
                placeholder="انتخاب نقش..."
                {...register('role')}
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
                <span className="text-sm text-gray-700">کاربر فعال است</span>
              </label>
            </FormField>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSaving}>
            ذخیره
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
