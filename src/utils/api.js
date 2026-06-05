import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });

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
    const requestUrl = err.config?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (err.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('aurum_token');
      localStorage.removeItem('aurum_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export default api;
