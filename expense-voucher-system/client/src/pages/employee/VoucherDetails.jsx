import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVoucherById, deleteVoucher, submitVoucher } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export default function VoucherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVoucher() {
      try {
        const res = await getVoucherById(id);
        setVoucher(res.data.voucher);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Voucher not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchVoucher();
  }, [id]);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteVoucher(id);
      navigate('/employee/my-vouchers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete.');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      await submitVoucher(id);
      const res = await getVoucherById(id);
      setVoucher(res.data.voucher);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit.');
    } finally {
      setActionLoading(false);
      setShowSubmitModal(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  if (!voucher) {
    return <div className="text-center py-20 text-gray-500">{error || 'Voucher not found.'}</div>;
  }

  const isDraft = voucher.status === 'draft';

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/employee/my-vouchers" className="text-sm text-primary hover:underline mb-4 inline-block">← Back to My Vouchers</Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{voucher.expense_title}</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">{voucher.voucher_number}</p>
          </div>
          <StatusBadge status={voucher.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Category</p>
            <p className="text-sm font-medium text-gray-800">{voucher.expense_category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Department</p>
            <p className="text-sm font-medium text-gray-800">{voucher.department}</p>
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
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Employee</p>
            <p className="text-sm font-medium text-gray-800">{voucher.creator?.name || '—'}</p>
          </div>
        </div>

        {/* Description */}
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
              <p className="text-sm text-gray-400 italic">Not yet approved</p>
            )}
          </div>
        </div>

        {/* Rejection Reason */}
        {voucher.status === 'rejected' && voucher.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-xs text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700">{voucher.rejection_reason}</p>
          </div>
        )}

        {/* Approval Date */}
        {voucher.status === 'approved' && voucher.approval_date && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Approved On</p>
            <p className="text-sm font-medium text-green-600">{formatDateTime(voucher.approval_date)}</p>
          </div>
        )}

        {/* Audit Info */}
        <div className="border-t border-gray-100 pt-4 flex gap-6 text-xs text-gray-400">
          <span>Created: {formatDateTime(voucher.created_at)}</span>
          <span>Updated: {formatDateTime(voucher.updated_at)}</span>
        </div>

        {/* Actions for draft vouchers */}
        {isDraft && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            {!voucher.employee_signature && (
              <p className="text-xs text-amber-600 self-center mr-auto">
                ⚠ No signature uploaded. You can still submit, but add one via Edit before final approval.
              </p>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
            >
              Delete
            </button>
            <Link
              to={`/employee/edit-voucher/${voucher.id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors cursor-pointer"
            >
              Submit for Approval
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Voucher"
        message="Are you sure you want to delete this draft voucher? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText={actionLoading ? 'Deleting...' : 'Delete'}
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Submit Modal */}
      <ConfirmModal
        isOpen={showSubmitModal}
        title="Submit Voucher"
        message="Once submitted, you won't be able to edit this voucher. Are you sure?"
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitModal(false)}
        confirmText={actionLoading ? 'Submitting...' : 'Submit'}
      />
    </div>
  );
}
