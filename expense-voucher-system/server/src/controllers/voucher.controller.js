const supabase = require('../config/supabase');
const generateVoucherNumber = require('../utils/generateVoucherNumber');

// POST /api/vouchers — Create a new voucher (Employee only)
const createVoucher = async (req, res) => {
  try {
    const {
      voucher_date, expense_date, department, expense_title,
      expense_category, expense_description, amount, employee_signature
    } = req.body;

    // Validations
    if (!department) return res.status(400).json({ error: 'Department is required.' });
    if (!expense_title) return res.status(400).json({ error: 'Expense title is required.' });
    if (!expense_date) return res.status(400).json({ error: 'Expense date is required.' });
    if (!amount || parseFloat(amount) <= 0) return res.status(400).json({ error: 'Amount must be greater than zero.' });
    if (!expense_category) return res.status(400).json({ error: 'Expense category is required.' });

    const voucher_number = await generateVoucherNumber();

    const { data, error } = await supabase
      .from('vouchers')
      .insert({
        voucher_number,
        created_by: req.user.id,
        voucher_date: voucher_date || new Date().toISOString().slice(0, 10),
        expense_date,
        department,
        expense_title,
        expense_category,
        expense_description: expense_description || '',
        amount: parseFloat(amount),
        status: 'draft',
        employee_signature: employee_signature || null
      })
      .select()
      .single();

    if (error) {
      console.error('Create voucher error:', error);
      return res.status(500).json({ error: 'Failed to create voucher.' });
    }

    res.status(201).json({ message: 'Voucher created as draft.', voucher: data });
  } catch (err) {
    console.error('Create voucher error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/vouchers — List vouchers (scoped by role)
const getAllVouchers = async (req, res) => {
  try {
    let query = supabase
      .from('vouchers')
      .select('*, creator:users!created_by(name, email, employee_id, department)')
      .order('created_at', { ascending: false });

    // Employee can only see their own vouchers
    if (req.user.role === 'employee') {
      query = query.eq('created_by', req.user.id);
    }

    // Server-side filters from query params
    const { status, category, department, sortBy, sortOrder } = req.query;

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('expense_category', category);
    if (department) query = query.eq('department', department);

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch vouchers error:', error);
      return res.status(500).json({ error: 'Failed to fetch vouchers.' });
    }

    res.json({ vouchers: data });
  } catch (err) {
    console.error('Fetch vouchers error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/vouchers/:id — Get single voucher
const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('vouchers')
      .select('*, creator:users!created_by(name, email, employee_id, department), approver:users!approved_by(name, email)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    // Employee can only view their own
    if (req.user.role === 'employee' && data.created_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only view your own vouchers.' });
    }

    res.json({ voucher: data });
  } catch (err) {
    console.error('Fetch voucher error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/vouchers/:id — Edit a draft voucher (Employee only)
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing voucher
    const { data: existing, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    // Business rules
    if (existing.created_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own vouchers.' });
    }
    if (existing.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft vouchers can be edited.' });
    }

    const {
      voucher_date, expense_date, department, expense_title,
      expense_category, expense_description, amount, employee_signature
    } = req.body;

    // Validations
    if (!department) return res.status(400).json({ error: 'Department is required.' });
    if (!expense_title) return res.status(400).json({ error: 'Expense title is required.' });
    if (!expense_date) return res.status(400).json({ error: 'Expense date is required.' });
    if (!amount || parseFloat(amount) <= 0) return res.status(400).json({ error: 'Amount must be greater than zero.' });

    const { data, error } = await supabase
      .from('vouchers')
      .update({
        voucher_date, expense_date, department, expense_title,
        expense_category, expense_description,
        amount: parseFloat(amount),
        employee_signature: employee_signature || existing.employee_signature
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update voucher error:', error);
      return res.status(500).json({ error: 'Failed to update voucher.' });
    }

    res.json({ message: 'Voucher updated.', voucher: data });
  } catch (err) {
    console.error('Update voucher error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE /api/vouchers/:id — Delete a draft voucher (Employee only)
const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    if (existing.created_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own vouchers.' });
    }
    if (existing.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft vouchers can be deleted.' });
    }

    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete voucher error:', error);
      return res.status(500).json({ error: 'Failed to delete voucher.' });
    }

    res.json({ message: 'Voucher deleted.' });
  } catch (err) {
    console.error('Delete voucher error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PATCH /api/vouchers/:id/submit — Submit a draft voucher
const submitVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    if (existing.created_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only submit your own vouchers.' });
    }
    if (existing.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft vouchers can be submitted.' });
    }
    if (!existing.employee_signature) {
      return res.status(400).json({ error: 'Employee signature is required before submission.' });
    }

    const { data, error } = await supabase
      .from('vouchers')
      .update({ status: 'pending_approval' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Submit voucher error:', error);
      return res.status(500).json({ error: 'Failed to submit voucher.' });
    }

    res.json({ message: 'Voucher submitted for approval.', voucher: data });
  } catch (err) {
    console.error('Submit voucher error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PATCH /api/vouchers/:id/approve — Director approves a voucher
const approveVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { director_signature } = req.body;

    if (!director_signature) {
      return res.status(400).json({ error: 'Director signature is required to approve.' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    if (existing.status !== 'pending_approval') {
      return res.status(400).json({ error: 'Only pending vouchers can be approved.' });
    }

    const { data, error } = await supabase
      .from('vouchers')
      .update({
        status: 'approved',
        director_signature,
        approved_by: req.user.id,
        approval_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Approve voucher error:', error);
      return res.status(500).json({ error: 'Failed to approve voucher.' });
    }

    res.json({ message: 'Voucher approved.', voucher: data });
  } catch (err) {
    console.error('Approve voucher error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PATCH /api/vouchers/:id/reject — Director rejects a voucher
const rejectVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required.' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    if (existing.status !== 'pending_approval') {
      return res.status(400).json({ error: 'Only pending vouchers can be rejected.' });
    }

    const { data, error } = await supabase
      .from('vouchers')
      .update({
        status: 'rejected',
        rejection_reason: rejection_reason.trim(),
        approved_by: req.user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Reject voucher error:', error);
      return res.status(500).json({ error: 'Failed to reject voucher.' });
    }

    res.json({ message: 'Voucher rejected.', voucher: data });
  } catch (err) {
    console.error('Reject voucher error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher
};
