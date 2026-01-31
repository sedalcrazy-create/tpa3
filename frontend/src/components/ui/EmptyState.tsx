import { InboxIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  message = 'داده‌ای یافت نشد',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      {icon || <InboxIcon className="w-16 h-16 mb-3" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}
