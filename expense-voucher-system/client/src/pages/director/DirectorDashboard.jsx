import { useState, useEffect } from 'react';
import { getDashboardStats, getVouchers } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import VoucherTable from '../../components/VoucherTable';
import { formatCurrency } from '../../utils/formatCurrency';

export default function DirectorDashboard() {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Director Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard title="Pending Approval" value={stats?.pending || 0} color="text-amber-600" />
        <StatsCard title="Approved Today" value={stats?.approvedToday || 0} color="text-green-600" />
        <StatsCard title="Rejected Today" value={stats?.rejectedToday || 0} color="text-red-600" />
        <StatsCard title="Pending Amount" value={formatCurrency(stats?.totalPendingAmount || 0)} color="text-amber-600" />
        <StatsCard title="Total Vouchers" value={stats?.total || 0} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <VoucherTable vouchers={recentVouchers} basePath="/director/voucher" showEmployee />
      </div>
    </div>
  );
}
