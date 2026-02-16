import DashboardLayout from '../layouts/DashboardLayout';
import UserManagement from '../components/admin/UserManagement';

const StatCard = ({ label, value, change, accent }) => {
  const accents = {
    blue: 'stat-card-accent',
    green: 'stat-card-success',
    purple: 'stat-card-warning',
  };

  return (
    <div className={`stat-card ${accents[accent]} bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5`}>
      <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-[var(--color-text)] tracking-tight">{value}</p>
        {change && (
          <span className="text-[11px] font-semibold text-[var(--color-success)]">{change}</span>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Manage users and system settings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Users" value="--" accent="blue" />
          <StatCard label="Active Sessions" value="--" accent="green" />
          <StatCard label="System Status" value="Online" accent="purple" />
        </div>

        <UserManagement />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
