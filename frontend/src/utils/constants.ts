import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CubeIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  FolderOpenIcon,
  BuildingOffice2Icon,
  BanknotesIcon,
  ScaleIcon,
  ChartBarIcon,
  UserGroupIcon,
  KeyIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

export interface MenuItem {
  title: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: { title: string; path: string }[];
}

export const MENU_ITEMS: MenuItem[] = [
  { title: 'داشبورد', path: '/', icon: HomeIcon },
  {
    title: 'مدیریت پرسنل',
    path: '/employees',
    icon: UsersIcon,
    children: [
      { title: 'لیست پرسنل', path: '/employees' },
      { title: 'ورود گروهی', path: '/employees/import' },
    ],
  },
  {
    title: 'بیمه‌نامه',
    path: '/insurances',
    icon: ShieldCheckIcon,
    children: [
      { title: 'لیست بیمه‌نامه', path: '/insurances' },
      { title: 'استعلام', path: '/insurances/inquiry' },
    ],
  },
  { title: 'قراردادها', path: '/contracts', icon: DocumentTextIcon },
  { title: 'کاتالوگ دارو و خدمات', path: '/items', icon: CubeIcon },
  { title: 'تشخیص (ICD)', path: '/diagnoses', icon: BeakerIcon },
  { title: 'نسخه‌ها', path: '/prescriptions', icon: ClipboardDocumentListIcon },
  { title: 'صورتحساب', path: '/invoices', icon: DocumentDuplicateIcon },
  { title: 'پرونده خسارت', path: '/claims', icon: FolderOpenIcon },
  { title: 'مراکز درمانی', path: '/centers', icon: BuildingOffice2Icon },
  { title: 'تسویه مالی', path: '/settlements', icon: BanknotesIcon },
  {
    title: 'کمیسیون پزشکی',
    path: '/commission/cases',
    icon: ScaleIcon,
    children: [
      { title: 'پرونده‌ها', path: '/commission/cases' },
      { title: 'مددکاری', path: '/commission/social-work' },
    ],
  },
  {
    title: 'گزارشات',
    path: '/reports/claims',
    icon: ChartBarIcon,
    children: [
      { title: 'گزارش خسارات', path: '/reports/claims' },
      { title: 'گزارش مالی', path: '/reports/financial' },
    ],
  },
  {
    title: 'مدیریت کاربران',
    path: '/users',
    icon: UserGroupIcon,
    children: [
      { title: 'کاربران', path: '/users' },
      { title: 'نقش‌ها و دسترسی‌ها', path: '/roles' },
    ],
  },
  { title: 'لاگ سیستم', path: '/audit', icon: ClipboardDocumentCheckIcon },
];

export const STATUS_LABELS: Record<string, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  pending: 'در انتظار',
  approved: 'تایید شده',
  rejected: 'رد شده',
  draft: 'پیش‌نویس',
  submitted: 'ارسال شده',
  processing: 'در حال بررسی',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  paid: 'پرداخت شده',
  partial_paid: 'پرداخت جزئی',
  failed: 'ناموفق',
  staged: 'آماده بررسی',
  retired: 'بازنشسته',
  suspended: 'معلق',
  deceased: 'فوت شده',
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-indigo-100 text-indigo-800',
  processing: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-800',
  partial_paid: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  staged: 'bg-purple-100 text-purple-800',
  retired: 'bg-teal-100 text-teal-800',
  suspended: 'bg-orange-100 text-orange-800',
  deceased: 'bg-gray-200 text-gray-700',
};

export const GENDER_OPTIONS = [
  { value: 'male', label: 'مرد' },
  { value: 'female', label: 'زن' },
];
