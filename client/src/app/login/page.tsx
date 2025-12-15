'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">MPMS Login</h2>
          <p className="mt-2 text-gray-600">Sign in to manage your projects</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                {...register('email', { required: true })}
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...register('password', { required: true })}
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="********"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Register here
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}