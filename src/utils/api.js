import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('aurum_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aurum_token');
      localStorage.removeItem('aurum_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
