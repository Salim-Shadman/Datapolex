'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Loader2, Save, User as UserIcon } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth(); 
  
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

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
      setAvatarUrl(res.data.url);
      toast.success('Image uploaded! Click Save to apply.');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.put('/users/profile', {
        ...data,
        avatar: avatarUrl
      });

      
      updateUser(res.data);
      
      toast.success('Profile Updated!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
            <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="flex flex-col items-center mb-6">
                <div className="relative h-24 w-24 mb-3">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="h-full w-full rounded-full object-cover border-4 border-indigo-50" />
                    ) : (
                        <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                            <UserIcon size={40} />
                        </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-700 shadow-lg border-2 border-white">
                        {uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14} />}
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                </div>
                <p className="text-xs text-gray-500">Click the camera icon to change photo</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input {...register('name')} defaultValue={user?.name} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input {...register('email')} defaultValue={user?.email} className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
            </div>

            <button type="submit" disabled={loading || uploading} className="w-full flex items-center justify-center py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition disabled:opacity-70 mt-4">
                {loading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>}
                Save Changes
            </button>
        </form>
      </div>
    </div>
  );
}