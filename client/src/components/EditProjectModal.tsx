'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onUpdate: (updatedProject: any) => void;
}

export default function EditProjectModal({ isOpen, onClose, project, onUpdate }: EditProjectModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // মডাল ওপেন হলে কারেন্ট ডেটা দিয়ে ফর্ম ফিল করা
  useEffect(() => {
    if (project) {
      setThumbnailUrl(project.thumbnail || '');
      setValue('title', project.title);
      setValue('client', project.client);
      setValue('description', project.description);
      setValue('budget', project.budget);
      setValue('status', project.status);
      
      // Date formatting for input type="date"
      if (project.startDate) setValue('startDate', new Date(project.startDate).toISOString().split('T')[0]);
      if (project.endDate) setValue('endDate', new Date(project.endDate).toISOString().split('T')[0]);
    }
  }, [project, setValue, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await api.post('/upload', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setThumbnailUrl(res.data.url);
      toast.success('Project thumbnail uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.put(`/projects/${project._id}`, {
        ...data,
        thumbnail: thumbnailUrl
      });

      onUpdate(res.data); // প্যারেন্ট কম্পোনেন্টে ডেটা আপডেট পাঠানো
      toast.success('Project updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Edit Project</h3>
            <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
        </div>

        <div className="overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Thumbnail Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Thumbnail</label>
                    <div className="flex items-center gap-4">
                        <div className="relative h-24 w-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <ImageIcon className="text-gray-400" size={32} />
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <label className="cursor-pointer flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium text-sm">
                            <Upload size={16} className="mr-2"/> Change Picture
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                        <input {...register('title')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                        <input {...register('client')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea {...register('description')} rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select {...register('status')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="planned">Planned</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" {...register('startDate')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" {...register('endDate')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                    <input type="number" {...register('budget')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-3 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                    <button type="submit" disabled={loading || uploading} className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition disabled:opacity-70">
                        {loading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}