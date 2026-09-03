import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { getVoucherById, approveVoucher, rejectVoucher, uploadSignature } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import PrintableVoucher from '../../components/PrintableVoucher';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export default function VoucherReview() {
  const { id } = useParams();
  const printRef = useRef();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Approve modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [dirSigFile, setDirSigFile] = useState(null);
  const [dirSigPreview, setDirSigPreview] = useState('');

  const handleDirSigFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDirSigFile(file);
    setDirSigPreview(URL.createObjectURL(file));
  };

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchVoucher() {
      try {
        const res = await getVoucherById(id);
        setVoucher(res.data.voucher);
      } catch (err) {
        setError('Voucher not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchVoucher();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      let sigUrl = '';
      if (dirSigFile) {
        const uploadRes = await uploadSignature(dirSigFile);
        sigUrl = uploadRes.data.url;
      }
      await approveVoucher(id, sigUrl);
      const res = await getVoucherById(id);
      setVoucher(res.data.voucher);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve.');
    } finally {
      setActionLoading(false);
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.');
      setShowRejectModal(false);
      return;
    }
    setActionLoading(true);
    try {
      await rejectVoucher(id, rejectionReason);
      const res = await getVoucherById(id);
      setVoucher(res.data.voucher);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject.');
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  if (!voucher) {
    return <div className="text-center py-20 text-gray-500">{error || 'Voucher not found.'}</div>;
  }

  const isPending = voucher.status === 'pending_approval';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Voucher-${voucher.voucher_number}`
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/director/pending-approvals" className="text-sm text-primary hover:underline">← Back to Vouchers</Link>
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          Print / Download PDF
        </button>
      </div>

      {/* Hidden printable voucher */}
      <div className="hidden print:block">
        <PrintableVoucher ref={printRef} voucher={voucher} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
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

        {/* Approve / Reject Actions */}
        {isPending && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-5 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={() => setShowApproveModal(true)}
              className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        title="Approve Voucher"
        message="Upload your signature to approve this voucher."
        onConfirm={handleApprove}
        onCancel={() => setShowApproveModal(false)}
        confirmText={actionLoading ? 'Approving...' : 'Approve'}
        confirmColor="bg-green-600 hover:bg-green-700"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Director Signature <span className="text-gray-400 font-normal">(optional — upload image)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleDirSigFile}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
          />
          {dirSigPreview && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Preview:</p>
              <img src={dirSigPreview} alt="Signature preview" className="h-16 border border-gray-200 rounded-lg p-2 bg-white object-contain" />
            </div>
          )}
        </div>
      </ConfirmModal>

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        title="Reject Voucher"
        message="Please provide a reason for rejecting this voucher."
        onConfirm={handleReject}
        onCancel={() => setShowRejectModal(false)}
        confirmText={actionLoading ? 'Rejecting...' : 'Reject'}
        confirmColor="bg-red-600 hover:bg-red-700"
      >
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={3}
          placeholder="Enter rejection reason..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
        />
      </ConfirmModal>
    </div>
  );
}
