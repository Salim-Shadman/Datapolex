'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = Cookies.get('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ✅ FIX: Login ফাংশনে রিডাইরেক্ট ফিরিয়ে আনা হয়েছে
  const login = (newToken: string, userData: any) => {
    setToken(newToken);
    setUser(userData);
    
    Cookies.set('token', newToken, { expires: 1 });
    localStorage.setItem('user', JSON.stringify(userData));
    
    // এই লাইনটি এখন ড্যাশবোর্ডে নিয়ে যাবে
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    Cookies.remove('token');
    localStorage.removeItem('user');
    
    router.push('/login');
  };

  const updateUser = (userData: any) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    if (userData.token) {
        setToken(userData.token);
        Cookies.set('token', userData.token, { expires: 1 });
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