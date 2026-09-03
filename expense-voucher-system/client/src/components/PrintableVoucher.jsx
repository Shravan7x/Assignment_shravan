import { forwardRef } from 'react';
import { formatDate, formatDateTime } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

// This component is rendered off-screen and used by react-to-print.
// Tailwind print: variants handle the print styling.
const PrintableVoucher = forwardRef(function PrintableVoucher({ voucher }, ref) {
  if (!voucher) return null;

  const statusLabels = {
    draft: 'Draft',
    submitted: 'Submitted',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  return (
    <div ref={ref} className="p-10 max-w-3xl mx-auto font-sans text-gray-900 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ExpenseFlow</h1>
          <p className="text-sm text-gray-500 mt-1">Expense Voucher Management System</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Voucher Number</p>
          <p className="text-lg font-mono font-bold text-indigo-700">{voucher.voucher_number}</p>
          <p className="text-xs text-gray-500 mt-1">Status: <span className="font-semibold">{statusLabels[voucher.status] || voucher.status}</span></p>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800 mb-6">{voucher.expense_title}</h2>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-5 mb-8">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Department</p>
          <p className="text-sm font-medium text-gray-800">{voucher.department}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Expense Category</p>
          <p className="text-sm font-medium text-gray-800">{voucher.expense_category}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Expense Date</p>
          <p className="text-sm font-medium text-gray-800">{formatDate(voucher.expense_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Voucher Date</p>
          <p className="text-sm font-medium text-gray-800">{formatDate(voucher.voucher_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Employee Name</p>
          <p className="text-sm font-medium text-gray-800">{voucher.creator?.name || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Employee ID</p>
          <p className="text-sm font-medium text-gray-800">{voucher.creator?.employee_id || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Employee Email</p>
          <p className="text-sm font-medium text-gray-800">{voucher.creator?.email || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(voucher.amount)}</p>
        </div>
      </div>

      {/* Description */}
      {voucher.expense_description && (
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Description</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200">
            {voucher.expense_description}
          </p>
        </div>
      )}

      {/* Approval Info */}
      {(voucher.status === 'approved' || voucher.status === 'rejected') && (
        <div className="mb-8 p-4 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Approval Information</p>
          <div className="grid grid-cols-2 gap-x-10 gap-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Decision</p>
              <p className={`text-sm font-semibold ${voucher.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                {voucher.status === 'approved' ? 'Approved' : 'Rejected'}
              </p>
            </div>
            {voucher.approval_date && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Date</p>
                <p className="text-sm font-medium">{formatDateTime(voucher.approval_date)}</p>
              </div>
            )}
            {voucher.approver && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Reviewed By</p>
                <p className="text-sm font-medium">{voucher.approver.name}</p>
              </div>
            )}
            {voucher.rejection_reason && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700 font-medium">{voucher.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-10 mb-8">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Employee Signature</p>
          {voucher.employee_signature ? (
            <img
              src={voucher.employee_signature}
              alt="Employee Signature"
              className="h-20 max-w-full object-contain border border-gray-200 rounded p-2 bg-white"
            />
          ) : (
            <div className="h-20 border border-dashed border-gray-300 rounded flex items-center justify-center">
              <p className="text-xs text-gray-400">Not provided</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2 border-t border-gray-300 pt-1">
            {voucher.creator?.name}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Director Signature</p>
          {voucher.director_signature ? (
            <img
              src={voucher.director_signature}
              alt="Director Signature"
              className="h-20 max-w-full object-contain border border-gray-200 rounded p-2 bg-white"
            />
          ) : (
            <div className="h-20 border border-dashed border-gray-300 rounded flex items-center justify-center">
              <p className="text-xs text-gray-400">Not yet signed</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2 border-t border-gray-300 pt-1">
            Director / Authorized Signatory
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 flex justify-between text-xs text-gray-400">
        <span>Created: {formatDateTime(voucher.created_at)}</span>
        <span>Last Updated: {formatDateTime(voucher.updated_at)}</span>
        <span>Printed: {new Date().toLocaleDateString('en-IN')}</span>
      </div>
    </div>
  );
});

export default PrintableVoucher;
