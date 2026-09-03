import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVouchers, approveVoucher, rejectVoucher } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import SearchFilterBar from '../../components/SearchFilterBar';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export default function PendingApprovals() {
  const navigate = useNavigate();
  const [allVouchers, setAllVouchers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approve modal state
  const [approveTarget, setApproveTarget] = useState(null);
  const [dirSigUrl, setDirSigUrl] = useState('');

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await getVouchers({ status: 'pending_approval' });
      setAllVouchers(res.data.vouchers);
      setFiltered(res.data.vouchers);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      // Director signature URL is optional — can be empty string for now
      await approveVoucher(approveTarget.id, dirSigUrl || '');
      setApproveTarget(null);
      setDirSigUrl('');
      setError('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setActionLoading(true);
    try {
      await rejectVoucher(rejectTarget.id, rejectReason);
      setRejectTarget(null);
      setRejectReason('');
      setError('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
      <p className="text-sm text-gray-500 mb-4">{allVouchers.length} voucher(s) waiting for your review</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <SearchFilterBar vouchers={allVouchers} onFiltered={setFiltered} />
      <p className="text-sm text-gray-400 mb-2">{filtered.length} result(s)</p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400">No pending vouchers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Voucher #</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Department</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td
                    className="px-4 py-3 font-mono text-xs text-indigo-600 font-medium cursor-pointer hover:underline"
                    onClick={() => navigate(`/director/voucher/${v.id}`)}
                  >
                    {v.voucher_number}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{v.creator?.name || '—'}</td>
                  <td
                    className="px-4 py-3 text-gray-800 font-medium cursor-pointer hover:underline"
                    onClick={() => navigate(`/director/voucher/${v.id}`)}
                  >
                    {v.expense_title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.department}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(v.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(v.expense_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApproveTarget(v)}
                        className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(v)}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={!!approveTarget}
        title={`Approve Voucher — ${approveTarget?.voucher_number}`}
        message={`${approveTarget?.expense_title} — ${formatCurrency(approveTarget?.amount)} by ${approveTarget?.creator?.name}`}
        onConfirm={handleApprove}
        onCancel={() => { setApproveTarget(null); setDirSigUrl(''); }}
        confirmText={actionLoading ? 'Approving...' : 'Approve'}
        confirmColor="bg-green-600 hover:bg-green-700"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Director Signature URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={dirSigUrl}
            onChange={(e) => setDirSigUrl(e.target.value)}
            placeholder="Paste public image URL, or leave blank"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
        </div>
      </ConfirmModal>

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={!!rejectTarget}
        title={`Reject Voucher — ${rejectTarget?.voucher_number}`}
        message="Please provide a reason for rejection."
        onConfirm={handleReject}
        onCancel={() => { setRejectTarget(null); setRejectReason(''); }}
        confirmText={actionLoading ? 'Rejecting...' : 'Reject'}
        confirmColor="bg-red-600 hover:bg-red-700"
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          placeholder="Enter rejection reason (required)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
        />
      </ConfirmModal>
    </div>
  );
}
