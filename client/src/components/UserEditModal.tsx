'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface UserEditModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserEditModal({ user, isOpen, onClose, onSuccess }: UserEditModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();

  // Set default values when modal opens
  useEffect(() => {
    if (user) {
      setValue('role', user.role);
    }
  }, [user, setValue]);

  const onSubmit = async (data: any) => {
    try {
      await api.put(`/users/${user._id}`, { role: data.role });
      toast.success('User role updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to update role');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Edit User Role</h2>
            <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
        </div>
        
        <div className="mb-4">
            <p className="text-sm text-gray-500">Updating role for: <span className="font-semibold text-gray-900">{user.name}</span></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select 
              {...register('role')} 
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
            </select>
          </div>
          
          <button type="submit" className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}