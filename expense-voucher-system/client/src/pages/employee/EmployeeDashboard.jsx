import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getVouchers } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import VoucherTable from '../../components/VoucherTable';
import { formatCurrency } from '../../utils/formatCurrency';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, vouchersRes] = await Promise.all([
          getDashboardStats(),
          getVouchers()
        ]);
        setStats(statsRes.data.stats);
        setRecentVouchers(vouchersRes.data.vouchers.slice(0, 5));
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
        <Link
          to="/employee/create-voucher"
          className="bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          + Create Voucher
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard title="Total" value={stats?.total || 0} icon="" />
        <StatsCard title="Draft" value={stats?.draft || 0} icon="" color="text-gray-600" />
        <StatsCard title="Pending" value={stats?.pending || 0} icon="" color="text-amber-600" />
        <StatsCard title="Approved" value={stats?.approved || 0} icon="" color="text-green-600" />
        <StatsCard title="Rejected" value={stats?.rejected || 0} icon="" color="text-red-600" />
        <StatsCard title="Total Claimed" value={formatCurrency(stats?.totalAmount || 0)} icon="" color="text-primary" />
      </div>

      {/* Recent Vouchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Vouchers</h2>
          <Link to="/employee/my-vouchers" className="text-sm text-primary hover:underline">
            View All →
          </Link>
        </div>
        <VoucherTable vouchers={recentVouchers} basePath="/employee/voucher" />
      </div>
    </div>
  );
}
