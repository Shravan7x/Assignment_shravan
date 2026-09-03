import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import CreateVoucher from './pages/employee/CreateVoucher';
import MyVouchers from './pages/employee/MyVouchers';
import EditVoucher from './pages/employee/EditVoucher';
import EmployeeVoucherDetails from './pages/employee/VoucherDetails';

import DirectorDashboard from './pages/director/DirectorDashboard';
import PendingApprovals from './pages/director/PendingApprovals';
import DirectorAllVouchers from './pages/director/AllVouchers';
import VoucherReview from './pages/director/VoucherReview';

import AccountsDashboard from './pages/accounts/AccountsDashboard';
import AccountsAllVouchers from './pages/accounts/AllVouchers';
import AccountsVoucherDetails from './pages/accounts/VoucherDetails';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']}><Layout /></ProtectedRoute>}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/create-voucher" element={<CreateVoucher />} />
            <Route path="/employee/my-vouchers" element={<MyVouchers />} />
            <Route path="/employee/voucher/:id" element={<EmployeeVoucherDetails />} />
            <Route path="/employee/edit-voucher/:id" element={<EditVoucher />} />
          </Route>

          {/* Director Routes */}
          <Route element={<ProtectedRoute allowedRoles={['director']}><Layout /></ProtectedRoute>}>
            <Route path="/director/dashboard" element={<DirectorDashboard />} />
            <Route path="/director/pending-approvals" element={<PendingApprovals />} />
            <Route path="/director/all-vouchers" element={<DirectorAllVouchers />} />
            <Route path="/director/voucher/:id" element={<VoucherReview />} />
          </Route>

          {/* Accounts Routes */}
          <Route element={<ProtectedRoute allowedRoles={['accounts']}><Layout /></ProtectedRoute>}>
            <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
            <Route path="/accounts/all-vouchers" element={<AccountsAllVouchers />} />
            <Route path="/accounts/voucher/:id" element={<AccountsVoucherDetails />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
