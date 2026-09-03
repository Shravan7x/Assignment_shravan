import { useState, useEffect } from 'react';
import { getVouchers } from '../../services/api';
import VoucherTable from '../../components/VoucherTable';

export default function PendingApprovals() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVouchers() {
      try {
        const res = await getVouchers({ status: 'pending_approval' });
        setVouchers(res.data.vouchers);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVouchers();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
      <p className="text-sm text-gray-500 mb-6">{vouchers.length} voucher(s) waiting for your review</p>
      <VoucherTable vouchers={vouchers} basePath="/director/voucher" showEmployee />
    </div>
  );
}
