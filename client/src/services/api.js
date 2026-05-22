import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied to localhost:5000 in dev and Vercel Edge in production
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/users/auth') &&
      !original.url?.includes('/users/refresh') &&
      !original.url?.includes('/users')
    ) {
      original._retry = true;
      try {
        await api.post('/users/refresh');
        return api(original);
      } catch {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    if (!error.response) {
      // Network error (server down or disconnected)
      error.message = 'Unable to connect to the server. Please check your connection.';
      return Promise.reject(error);
    }

    if (error.response?.status >= 500) {
      error.message = error.response.data?.message || 'Server encountered an error. Please try again.';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
