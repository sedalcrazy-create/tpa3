import { Link, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, HomeIcon } from '@heroicons/react/24/outline';

const ROUTE_LABELS: Record<string, string> = {
  '': 'داشبورد',
  employees: 'مدیریت پرسنل',
  create: 'ایجاد',
  edit: 'ویرایش',
  family: 'خانواده',
  insurances: 'بیمه‌نامه',
  inquiry: 'استعلام',
  contracts: 'قراردادها',
  items: 'کاتالوگ دارو و خدمات',
  price: 'قیمت‌گذاری',
  diagnoses: 'تشخیص',
  prescriptions: 'نسخه‌ها',
  invoices: 'صورتحساب',
  claims: 'پرونده خسارت',
  centers: 'مراکز درمانی',
  settlements: 'تسویه مالی',
  commission: 'کمیسیون پزشکی',
  cases: 'پرونده‌ها',
  'social-work': 'مددکاری',
  reports: 'گزارشات',
  financial: 'گزارش مالی',
  users: 'مدیریت کاربران',
  roles: 'نقش‌ها و دسترسی‌ها',
  audit: 'لاگ سیستم',
  import: 'ورود گروهی',
};

export default function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = ROUTE_LABELS[seg] || (seg.match(/^\d+$/) ? `#${seg}` : seg);
    const isLast = i === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      <Link to="/" className="hover:text-primary transition-colors">
        <HomeIcon className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronLeftIcon className="w-3 h-3" />
          {crumb.isLast ? (
            <span className="text-gray-800 font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-primary transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
