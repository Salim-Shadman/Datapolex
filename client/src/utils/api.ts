import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';


const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '';


const finalApiUrl = baseApiUrl.endsWith('/api') ? baseApiUrl : `${baseApiUrl}/api`;
// ------------------------------------------

const api = axios.create({
  baseURL: finalApiUrl, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});


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


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

   
    if (!error.response) {
      toast.error('Network error! Please check your connection or server status.');
      return Promise.reject(error);
    }

   
    if (error.response.status === 401 && !originalRequest._retry) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        Cookies.remove('token');
        localStorage.removeItem('user');
        
        if (!document.querySelector('.toast-session-expired')) {
            toast.error('Session expired. Please login again.', { className: 'toast-session-expired' });
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }
      }
    }

  
    if (error.response.status >= 500) {
      toast.error('Server error! Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;