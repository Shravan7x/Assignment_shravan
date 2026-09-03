import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVoucherById, updateVoucher } from '../../services/api';

const CATEGORIES = ['Travel', 'Food', 'Office Supplies', 'Software', 'Equipment', 'Training', 'Other'];

export default function EditVoucher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    expense_title: '',
    expense_category: '',
    department: '',
    expense_date: '',
    voucher_date: '',
    amount: '',
    expense_description: '',
    employee_signature: ''
  });

  // Signature file handling
  const [sigFile, setSigFile] = useState(null);
  const [sigPreview, setSigPreview] = useState('');

  const handleSigFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSigFile(file);
    setSigPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    async function fetchVoucher() {
      try {
        const res = await getVoucherById(id);
        const v = res.data.voucher;

        if (v.status !== 'draft') {
          navigate(`/employee/voucher/${id}`);
          return;
        }

        setForm({
          expense_title: v.expense_title || '',
          expense_category: v.expense_category || '',
          department: v.department || '',
          expense_date: v.expense_date || '',
          voucher_date: v.voucher_date || '',
          amount: v.amount || '',
          expense_description: v.expense_description || '',
          employee_signature: v.employee_signature || ''
        });
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVoucher();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!form.department.trim()) newErrors.department = 'Department is required';
    if (!form.expense_title.trim()) newErrors.expense_title = 'Expense title is required';
    if (!form.expense_date) newErrors.expense_date = 'Expense date is required';
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Amount must be greater than zero';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      let signatureUrl = form.employee_signature;

      // If a new file was chosen, upload it to Supabase via our API
      if (sigFile) {
        const fd = new FormData();
        fd.append('signature', sigFile);
        const { uploadSignature } = await import('../../services/api');
        const uploadRes = await uploadSignature(sigFile);
        signatureUrl = uploadRes.data.url;
      }

      await updateVoucher(id, { ...form, amount: parseFloat(form.amount), employee_signature: signatureUrl });
      navigate(`/employee/voucher/${id}`);
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Failed to update voucher.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Draft Voucher</h1>

      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {errors.form}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title *</label>
            <input type="text" name="expense_title" value={form.expense_title} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
            {errors.expense_title && <p className="text-red-500 text-xs mt-1">{errors.expense_title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select name="expense_category" value={form.expense_category} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <input type="text" name="department" value={form.department} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} min="0.01" step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date *</label>
            <input type="date" name="expense_date" value={form.expense_date} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
            {errors.expense_date && <p className="text-red-500 text-xs mt-1">{errors.expense_date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Date</label>
            <input type="date" name="voucher_date" value={form.voucher_date} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="expense_description" value={form.expense_description} onChange={handleChange} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none" />
        </div>

        {/* Employee Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Signature <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1">(required before submission)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleSigFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          {/* Preview */}
          {(sigPreview || form.employee_signature) && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Preview:</p>
              <img
                src={sigPreview || form.employee_signature}
                alt="Signature preview"
                className="h-20 border border-gray-200 rounded-lg p-2 bg-white object-contain"
              />
            </div>
          )}
          {!sigPreview && !form.employee_signature && (
            <p className="text-xs text-amber-600 mt-1">No signature uploaded yet. You must add one before submitting.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => navigate(`/employee/voucher/${id}`)}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
