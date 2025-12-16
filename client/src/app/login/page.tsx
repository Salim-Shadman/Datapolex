'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff, LayoutDashboard } from 'lucide-react'; 

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      toast.success('Login Successful!');
      login(res.data.token, res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <LayoutDashboard size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-500">Sign in to MPMS Workspace</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                {...register('email', { required: true })}
                type="email"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="admin@datapolex.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                    {...register('password', { required: true })}
                    type={showPassword ? "text" : "password"}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    placeholder="password123"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="text-center mt-4 pt-4 border-t border-gray-50">
            <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Register here
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}