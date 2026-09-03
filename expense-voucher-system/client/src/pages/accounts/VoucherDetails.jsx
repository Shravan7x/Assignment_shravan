import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVoucherById } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export default function VoucherDetails() {
  const { id } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVoucher() {
      try {
        const res = await getVoucherById(id);
        setVoucher(res.data.voucher);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVoucher();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  if (!voucher) {
    return <div className="text-center py-20 text-gray-500">Voucher not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/accounts/all-vouchers" className="text-sm text-primary hover:underline mb-4 inline-block">← Back to All Vouchers</Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{voucher.expense_title}</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">{voucher.voucher_number}</p>
          </div>
          <StatusBadge status={voucher.status} />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Employee</p>
            <p className="text-sm font-medium text-gray-800">{voucher.creator?.name || '—'}</p>
            {voucher.creator?.employee_id && (
              <p className="text-xs text-gray-500">ID: {voucher.creator.employee_id}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Department</p>
            <p className="text-sm font-medium text-gray-800">{voucher.department}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Category</p>
            <p className="text-sm font-medium text-gray-800">{voucher.expense_category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Amount</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(voucher.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Expense Date</p>
            <p className="text-sm font-medium text-gray-800">{formatDate(voucher.expense_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Voucher Date</p>
            <p className="text-sm font-medium text-gray-800">{formatDate(voucher.voucher_date)}</p>
          </div>
        </div>

        {voucher.expense_description && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{voucher.expense_description}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Employee Signature</p>
            {voucher.employee_signature ? (
              <img src={voucher.employee_signature} alt="Employee Signature" className="h-20 border border-gray-200 rounded-lg p-2 bg-white" />
            ) : (
              <p className="text-sm text-gray-400 italic">Not uploaded</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Director Signature</p>
            {voucher.director_signature ? (
              <img src={voucher.director_signature} alt="Director Signature" className="h-20 border border-gray-200 rounded-lg p-2 bg-white" />
            ) : (
              <p className="text-sm text-gray-400 italic">Not yet signed</p>
            )}
          </div>
        </div>

        {/* Rejection reason */}
        {voucher.status === 'rejected' && voucher.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-xs text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700">{voucher.rejection_reason}</p>
          </div>
        )}

        {voucher.status === 'approved' && voucher.approval_date && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Approved On</p>
            <p className="text-sm font-medium text-green-600">{formatDateTime(voucher.approval_date)}</p>
          </div>
        )}

        {/* Audit */}
        <div className="border-t border-gray-100 pt-4 flex gap-6 text-xs text-gray-400">
          <span>Created: {formatDateTime(voucher.created_at)}</span>
          <span>Updated: {formatDateTime(voucher.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}
