import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = () =>
  api.get('/auth/me');

// --- Vouchers ---
export const getVouchers = (params) =>
  api.get('/vouchers', { params });

export const getVoucherById = (id) =>
  api.get(`/vouchers/${id}`);

export const createVoucher = (data) =>
  api.post('/vouchers', data);

export const updateVoucher = (id, data) =>
  api.put(`/vouchers/${id}`, data);

export const deleteVoucher = (id) =>
  api.delete(`/vouchers/${id}`);

export const submitVoucher = (id) =>
  api.patch(`/vouchers/${id}/submit`);

export const approveVoucher = (id, director_signature) =>
  api.patch(`/vouchers/${id}/approve`, { director_signature });

export const rejectVoucher = (id, rejection_reason) =>
  api.patch(`/vouchers/${id}/reject`, { rejection_reason });

// --- Dashboard ---
export const getDashboardStats = () =>
  api.get('/dashboard/stats');

// --- Upload ---
export const uploadSignature = (file) => {
  const formData = new FormData();
  formData.append('signature', file);
  return api.post('/upload/signature', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export default api;
