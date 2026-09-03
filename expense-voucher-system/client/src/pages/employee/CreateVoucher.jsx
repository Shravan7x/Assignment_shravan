import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVoucher, submitVoucher, uploadSignature } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Travel', 'Food', 'Office Supplies', 'Software', 'Equipment', 'Training', 'Other'];

export default function CreateVoucher() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [sigFile, setSigFile] = useState(null);
  const [form, setForm] = useState({
    expense_title: '',
    expense_category: '',
    department: user?.department || '',
    expense_date: '',
    voucher_date: new Date().toISOString().slice(0, 10),
    amount: '',
    expense_description: '',
    employee_signature: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = (isSubmit = false) => {
    const newErrors = {};
    if (!form.department.trim()) newErrors.department = 'Department is required';
    if (!form.expense_title.trim()) newErrors.expense_title = 'Expense title is required';
    if (!form.expense_date) newErrors.expense_date = 'Expense date is required';
    if (!form.expense_category) newErrors.expense_category = 'Category is required';
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Amount must be greater than zero';
    if (isSubmit && !sigFile && !form.employee_signature) {
      newErrors.employee_signature = 'Signature image is required before submission';
    }
    return newErrors;
  };

  const handleSaveDraft = async () => {
    const validationErrors = validate(false);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      let finalForm = { ...form };
      if (sigFile) {
        const uploadRes = await uploadSignature(sigFile);
        finalForm.employee_signature = uploadRes.data.url;
      }
      await createVoucher(finalForm);
      navigate('/employee/my-vouchers');
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Failed to save voucher.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate(true);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      let finalForm = { ...form };
      if (sigFile) {
        const uploadRes = await uploadSignature(sigFile);
        finalForm.employee_signature = uploadRes.data.url;
      }
      const createRes = await createVoucher(finalForm);
      const newVoucherId = createRes.data.voucher.id;
      await submitVoucher(newVoucherId);
      navigate('/employee/my-vouchers');
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Failed to submit voucher.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Voucher</h1>

      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {errors.form}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Row 1: Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title *</label>
            <input
              type="text"
              name="expense_title"
              value={form.expense_title}
              onChange={handleChange}
              placeholder="e.g., Client Meeting Lunch"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            />
            {errors.expense_title && <p className="text-red-500 text-xs mt-1">{errors.expense_title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="expense_category"
              value={form.expense_category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.expense_category && <p className="text-red-500 text-xs mt-1">{errors.expense_category}</p>}
          </div>
        </div>

        {/* Row 2: Department & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g., Engineering"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            />
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
        </div>

        {/* Row 3: Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date *</label>
            <input
              type="date"
              name="expense_date"
              value={form.expense_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            />
            {errors.expense_date && <p className="text-red-500 text-xs mt-1">{errors.expense_date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Date</label>
            <input
              type="date"
              name="voucher_date"
              value={form.voucher_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            name="expense_description"
            value={form.expense_description}
            onChange={handleChange}
            rows={3}
            placeholder="Provide any additional details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none"
          />
        </div>

        {/* Row 5: Signature */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Signature <span className="text-gray-400 font-normal">(required for submission)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSigFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white"
            />
            {errors.employee_signature && <p className="text-red-500 text-xs mt-1">{errors.employee_signature}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => navigate('/employee/my-vouchers')}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}
