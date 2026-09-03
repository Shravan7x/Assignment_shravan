import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabelMap = {
    employee: 'Employee',
    director: 'Director',
    accounts: 'Accounts Team'
  };

  const roleBgMap = {
    employee: 'bg-blue-100 text-blue-700',
    director: 'bg-purple-100 text-purple-700',
    accounts: 'bg-green-100 text-green-700'
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome, {user?.name || 'User'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${roleBgMap[user?.role] || ''}`}>
          {roleLabelMap[user?.role] || user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          Logout →
        </button>
      </div>
    </header>
  );
}
