import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-gray-900">ExpenseFlow</h1>
        <p className="text-xs text-gray-500 mt-1">Voucher Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {user?.role === 'employee' && (
          <>
            <NavLink to="/employee/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/employee/create-voucher" className={linkClass}>
              Create Voucher
            </NavLink>
            <NavLink to="/employee/my-vouchers" className={linkClass}>
              My Vouchers
            </NavLink>
          </>
        )}

        {user?.role === 'director' && (
          <>
            <NavLink to="/director/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/director/pending-approvals" className={linkClass}>
              Pending Approvals
            </NavLink>
            <NavLink to="/director/all-vouchers" className={linkClass}>
              All Vouchers
            </NavLink>
          </>
        )}

        {user?.role === 'accounts' && (
          <>
            <NavLink to="/accounts/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/accounts/all-vouchers" className={linkClass}>
              All Vouchers
            </NavLink>
          </>
        )}
      </nav>

      {/* Role badge at bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200 px-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{user?.role}</p>
      </div>
    </aside>
  );
}
