import { useState, useEffect } from 'react';
import { getVouchers } from '../../services/api';
import VoucherTable from '../../components/VoucherTable';

export default function AllVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVouchers() {
      try {
        const res = await getVouchers();
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Vouchers</h1>
      <VoucherTable vouchers={vouchers} basePath="/director/voucher" showEmployee />
    </div>
  );
}
