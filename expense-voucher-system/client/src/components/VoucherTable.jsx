import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

export default function VoucherTable({ vouchers, basePath, showEmployee = false }) {
  const navigate = useNavigate();

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <p className="text-gray-400 text-lg">No vouchers found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Voucher #</th>
            {showEmployee && (
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Employee</th>
            )}
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Department</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr
              key={v.id}
              onClick={() => navigate(`${basePath}/${v.id}`)}
              className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs text-primary font-medium">
                {v.voucher_number}
              </td>
              {showEmployee && (
                <td className="px-4 py-3 text-gray-700">{v.creator?.name || '—'}</td>
              )}
              <td className="px-4 py-3 text-gray-800 font-medium">{v.expense_title}</td>
              <td className="px-4 py-3 text-gray-600">{v.expense_category}</td>
              <td className="px-4 py-3 text-gray-600">{v.department}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-800">
                {formatCurrency(v.amount)}
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(v.expense_date)}</td>
              <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
