import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports';
import { formatNumber } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  UsersIcon,
  ShieldCheckIcon,
  FolderOpenIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';

const COLORS = ['#7d3cff', '#c80e13', '#f2d53c', '#10b981', '#3b82f6', '#f97316', '#6366f1', '#ec4899'];

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{formatNumber(value)}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsApi.dashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">داشبورد</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="کل پرسنل"
          value={stats.total_employees}
          icon={<UsersIcon className="w-6 h-6 text-white" />}
          color="bg-primary"
        />
        <StatCard
          title="بیمه شدگان"
          value={stats.total_insured}
          icon={<ShieldCheckIcon className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="پرونده‌های خسارت"
          value={stats.total_claims}
          icon={<FolderOpenIcon className="w-6 h-6 text-white" />}
          color="bg-orange-500"
        />
        <StatCard
          title="صورتحساب‌ها"
          value={stats.total_invoices}
          icon={<DocumentDuplicateIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">خسارات بر اساس وضعیت</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.claims_by_status}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {stats.claims_by_status.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Claims by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">خسارات بر اساس نوع</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.claims_by_type}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#7d3cff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">روند ماهانه خسارات</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.monthly_trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="claims" stroke="#7d3cff" name="تعداد خسارات" strokeWidth={2} />
            <Line type="monotone" dataKey="amount" stroke="#c80e13" name="مبلغ" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Centers */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">مراکز پرمراجعه</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.top_centers} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" fontSize={11} />
            <YAxis dataKey="name" type="category" fontSize={11} width={120} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
