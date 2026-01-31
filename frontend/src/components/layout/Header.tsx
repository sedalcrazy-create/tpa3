import { ArrowRightOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    toast.success('خروج با موفقیت انجام شد');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-2 rounded-lg hover:bg-gray-100"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="TPA3" className="h-8 w-8" />
          <span className="font-bold text-primary hidden sm:block">سیستم بیمه درمان</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-danger hover:text-danger-light transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
