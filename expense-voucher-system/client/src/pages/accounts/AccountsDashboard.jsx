import { useState, useEffect } from 'react';
import { getDashboardStats, getVouchers } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import VoucherTable from '../../components/VoucherTable';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AccountsDashboard() {
  const [stats, setStats] = useState(null);
  const [recentApproved, setRecentApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, vouchersRes] = await Promise.all([
          getDashboardStats(),
          getVouchers({ status: 'approved' })
        ]);
        setStats(statsRes.data.stats);
        setRecentApproved(vouchersRes.data.vouchers.slice(0, 5));
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Accounts Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard title="Total Vouchers" value={stats?.total || 0} icon="📋" />
        <StatsCard title="Pending" value={stats?.pending || 0} icon="⏳" color="text-amber-600" />
        <StatsCard title="Approved" value={stats?.approved || 0} icon="✅" color="text-green-600" />
        <StatsCard title="Rejected" value={stats?.rejected || 0} icon="❌" color="text-red-600" />
        <StatsCard title="Approved Amount" value={formatCurrency(stats?.totalApprovedAmount || 0)} icon="💰" color="text-green-600" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Approved Vouchers</h2>
        <VoucherTable vouchers={recentApproved} basePath="/accounts/voucher" showEmployee />
      </div>
    </div>
  );
}
