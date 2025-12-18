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

  useEffect(() => {
    if (user) {
      setValue('role', user.role);
      setValue('department', user.department || '');
      setValue('skills', user.skills ? user.skills.join(', ') : '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: any) => {
    try {
      
      const skillsArray = data.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      
      await api.put(`/users/${user._id}`, { 
        role: data.role,
        department: data.department,
        skills: skillsArray
      });
      
      toast.success('User updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to update user');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex justify-between mb-6 border-b pb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Team Member</h2>
                <p className="text-sm text-gray-500">{user.name}</p>
            </div>
            <button onClick={onClose}><X className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role & Permissions</label>
            <select 
              {...register('role')} 
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            >
                <option value="member">Member (View & Update Tasks)</option>
                <option value="manager">Manager (Create Projects/Sprints)</option>
                <option value="admin">Admin (Full Access)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input 
                {...register('department')} 
                placeholder="e.g. Engineering, Design"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input 
                {...register('skills')} 
                placeholder="e.g. React, Node.js (Comma separated)"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            />
            <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
          </div>
          
          <div className="pt-4">
            <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}