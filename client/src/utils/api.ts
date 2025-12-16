import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (NEW: Handle 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // টোকেন এক্সপায়ারড বা ইনভ্যালিড হলে
      // লুপ আটকাতে চেক করুন আমরা ইতিমধ্যে লগইন পেজে আছি কিনা
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        Cookies.remove('token');
        localStorage.removeItem('user');
        
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;