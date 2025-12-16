'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/utils/api'; // Import API helper

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  department?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = Cookies.get('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        
        // Safety: Prevent crash if LocalStorage is corrupted
        if (storedUser) {
           try {
             setUser(JSON.parse(storedUser));
           } catch (e) {
             console.error("Failed to parse user data:", e);
             localStorage.removeItem('user');
           }
        }

        try {
          // Verify with server to get fresh data
          const { data } = await api.get('/users/profile');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          console.error("Session verification failed:", error);
          // Only log out if we don't have a cached user to show
          if (!storedUser) { 
             Cookies.remove('token');
             localStorage.removeItem('user');
          }
        }
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    
    Cookies.set('token', newToken, { expires: 1, secure: process.env.NODE_ENV === 'production' });
    localStorage.setItem('user', JSON.stringify(userData));
    
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    Cookies.remove('token');
    localStorage.removeItem('user');
    
    router.push('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    if (userData.token) {
        setToken(userData.token);
        Cookies.set('token', userData.token, { expires: 1, secure: process.env.NODE_ENV === 'production' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};