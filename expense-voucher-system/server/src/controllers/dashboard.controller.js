const supabase = require('../config/supabase');

// GET /api/dashboard/stats — Role-specific dashboard statistics
const getStats = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role === 'employee') {
      // Employee sees only their own voucher stats
      const { data: vouchers, error } = await supabase
        .from('vouchers')
        .select('status, amount')
        .eq('created_by', userId);

      if (error) throw error;

      const stats = {
        total: vouchers.length,
        draft: vouchers.filter(v => v.status === 'draft').length,
        pending: vouchers.filter(v => v.status === 'pending_approval').length,
        approved: vouchers.filter(v => v.status === 'approved').length,
        rejected: vouchers.filter(v => v.status === 'rejected').length,
        totalAmount: vouchers
          .filter(v => v.status === 'approved')
          .reduce((sum, v) => sum + parseFloat(v.amount), 0)
      };

      return res.json({ stats });
    }

    if (role === 'director') {
      const { data: vouchers, error } = await supabase
        .from('vouchers')
        .select('status, amount, approval_date, updated_at, created_at');

      if (error) throw error;

      const today = new Date().toISOString().slice(0, 10);

      const stats = {
        pending: vouchers.filter(v => v.status === 'pending_approval').length,
        approvedToday: vouchers.filter(v =>
          v.status === 'approved' && v.approval_date && v.approval_date.slice(0, 10) === today
        ).length,
        rejectedToday: vouchers.filter(v =>
          v.status === 'rejected' && v.updated_at && v.updated_at.slice(0, 10) === today
        ).length,
        totalPendingAmount: vouchers
          .filter(v => v.status === 'pending_approval')
          .reduce((sum, v) => sum + parseFloat(v.amount), 0),
        total: vouchers.length
      };

      return res.json({ stats });
    }

    if (role === 'accounts') {
      const { data: vouchers, error } = await supabase
        .from('vouchers')
        .select('status, amount');

      if (error) throw error;

      const stats = {
        total: vouchers.length,
        pending: vouchers.filter(v => v.status === 'pending_approval').length,
        approved: vouchers.filter(v => v.status === 'approved').length,
        rejected: vouchers.filter(v => v.status === 'rejected').length,
        totalApprovedAmount: vouchers
          .filter(v => v.status === 'approved')
          .reduce((sum, v) => sum + parseFloat(v.amount), 0)
      };

      return res.json({ stats });
    }

    res.status(400).json({ error: 'Unknown role.' });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

module.exports = { getStats };
