'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface SprintModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sprintToEdit?: any; 
}

export default function SprintModal({ projectId, isOpen, onClose, onSuccess, sprintToEdit }: SprintModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();

  
  useEffect(() => {
    if (sprintToEdit) {
        setValue('title', sprintToEdit.title);
      
        setValue('startDate', sprintToEdit.startDate.split('T')[0]);
        setValue('endDate', sprintToEdit.endDate.split('T')[0]);
    } else {
        reset();
    }
  }, [sprintToEdit, setValue, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (sprintToEdit) {
        
        await api.put(`/sprints/${sprintToEdit._id}`, data);
        toast.success('Sprint updated successfully');
      } else {
       
        await api.post('/sprints', { ...data, projectId });
        toast.success('Sprint created successfully');
      }
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to save sprint');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
                {sprintToEdit ? 'Edit Sprint' : 'Add New Sprint'}
            </h2>
            <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sprint Title</label>
            <input {...register('title', { required: true })} placeholder="e.g., Design Phase" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" {...register('startDate', { required: true })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" {...register('endDate', { required: true })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
             {sprintToEdit ? 'Update Sprint' : 'Create Sprint'}
          </button>
        </form>
      </div>
    </div>
  );
}