'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api'; 
import { taskService } from '@/services/taskService';
import toast from 'react-hot-toast';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import RichEditor from './RichEditor';

interface TaskModalProps {
  projectId: string;
  sprintId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskModal({ projectId, sprintId, isOpen, onClose, onSuccess }: TaskModalProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [users, setUsers] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const description = watch('description', '');

  useEffect(() => {
    if (isOpen) {
     
        api.get('/users?simple=true').then((res) => setUsers(res.data)).catch(console.error);
        register('description');
    }
  }, [isOpen, register]);

  const onEditorChange = (content: string) => {
    setValue('description', content);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileUrl(res.data.url);
      toast.success('File uploaded');
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        project: projectId,
        sprint: sprintId,
        assignees: [data.assignee],
        attachments: fileUrl ? [fileUrl] : [],
      };
      
      await taskService.create(payload);
      toast.success('Task created successfully');
      
      reset();
      setFileUrl(null);
      setValue('description', '');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input 
                {...register('title', { required: true })} 
                placeholder="e.g. Design Homepage UI"
                className="w-full border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select 
                {...register('assignee')} 
                className="w-full border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border bg-white"
            >
                <option value="">Select Team Member</option>
                {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <RichEditor 
                value={description} 
                onChange={onEditorChange} 
                placeholder="Describe the task in detail..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                    {...register('priority')} 
                    className="w-full border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border bg-white"
                >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimate (Hours)</label>
                <input 
                    type="number" 
                    {...register('estimate')} 
                    placeholder="e.g. 4"
                    className="w-full border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border" 
                />
            </div>
          </div>

          <div className="border-t pt-4 border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            <div className="flex items-center space-x-3">
                <label className="cursor-pointer flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2" />}
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.docx" />
                </label>
                
                {fileUrl && (
                    <div className="flex items-center px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                        <FileText className="w-3 h-3 mr-1" /> 
                        <span>Attached</span>
                        <button 
                            type="button" 
                            onClick={() => setFileUrl(null)}
                            className="ml-2 text-green-800 hover:text-red-600 font-bold"
                            title="Remove file"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Supported: Images, PDF (Max 5MB)</p>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose} className="mr-3 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
            <button 
                type="submit" 
                disabled={uploading} 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition shadow-lg shadow-indigo-200 disabled:opacity-70"
            >
                Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}