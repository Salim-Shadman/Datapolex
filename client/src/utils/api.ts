import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// --- FIX START: API URL Robustness ---
const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '';

// নিশ্চিত করা হচ্ছে যে BASE URL এর শেষে '/api' আছে।
// এটি ক্লায়েন্টকে সঠিক Vercel Serverless Function রুটে রিকোয়েস্ট করতে সাহায্য করে।
const finalApiUrl = baseApiUrl.endsWith('/api') ? baseApiUrl : `${baseApiUrl}/api`;

const api = axios.create({
  baseURL: finalApiUrl,
// --- FIX END ---
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s Timeout added
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

// Response Interceptor (Enhanced)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // 1. Handle Network Errors (Server Down / No Internet)
    if (!error.response) {
      toast.error('Network error! Please check your connection.');
      return Promise.reject(error);
    }

    // 2. Handle Session Expiry (401)
    if (error.response.status === 401 && !originalRequest._retry) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        Cookies.remove('token');
        localStorage.removeItem('user');
        
        // Prevent duplicate toasts
        if (!document.querySelector('.toast-session-expired')) {
            toast.error('Session expired. Please login again.', { className: 'toast-session-expired' });
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }
      }
    }

    // 3. Handle Server Errors (500)
    if (error.response.status >= 500) {
      toast.error('Server error! Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;