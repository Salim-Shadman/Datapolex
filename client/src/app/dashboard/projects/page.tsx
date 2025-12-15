'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Calendar, DollarSign, Trash2, Search, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProgressBar from '@/components/ProgressBar';
import ConfirmModal from '@/components/ConfirmModal'; // Import added

interface Project {
  _id: string;
  title: string;
  client: string;
  status: string;
  startDate: string;
  budget: number;
  thumbnail?: string;
  totalTasks?: number;
  completedTasks?: number;
  progress?: number;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Confirm Modal States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('client', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/projects?${params.toString()}`);
      setProjects(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchProjects(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setThumbnailUrl(res.data.url);
      toast.success('Thumbnail uploaded');
    } catch (error) { toast.error('Upload failed'); } 
    finally { setUploading(false); }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/projects', { ...data, thumbnail: thumbnailUrl });
      toast.success('Project Created');
      setIsModalOpen(false);
      reset();
      setThumbnailUrl(null);
      fetchProjects();
    } catch (error: any) { toast.error('Failed to create'); } 
    finally { setLoading(false); }
  };

  // Modified Delete Handler with Modal
  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Stop bubbling

    setConfirmAction(() => async () => {
        try {
            await api.delete(`/projects/${projectId}`);
            toast.success('Project deleted successfully');
            fetchProjects();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    });

    setConfirmTitle('Delete Project?');
    setConfirmMessage('Are you sure you want to delete this project? All tasks and sprints inside it will be permanently deleted.');
    setConfirmOpen(true);
  };

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <div className="flex flex-1 max-w-lg space-x-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search Client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full rounded-md border border-gray-300 py-2 text-sm focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-gray-300 py-2 text-sm focus:outline-none">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
            </select>
        </div>
        {isAdminOrManager && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" /> New Project
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project._id} className="relative group block rounded-lg bg-white shadow hover:shadow-md border border-gray-200 h-full overflow-hidden transition-shadow">
              {/* Thumbnail Section */}
              <div className="h-32 w-full bg-gray-100 relative">
                  {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                          <ImageIcon size={32} />
                      </div>
                  )}
                  
                  {/* Delete Button (Visible on Hover for Admin/Manager) */}
                  {isAdminOrManager && (
                    <button 
                        onClick={(e) => handleDeleteClick(e, project._id)} 
                        className="absolute top-2 right-2 p-2 bg-white/90 text-gray-500 hover:text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Project"
                    >
                        <Trash2 size={16} />
                    </button>
                  )}
              </div>

              <Link href={`/dashboard/projects/${project._id}`} className="block p-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-1 transition-colors">{project.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{project.client}</p>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{project.status}</span>
                    <div className="mt-4 mb-4"><ProgressBar total={project.totalTasks || 0} completed={project.completedTasks || 0} progress={project.progress || 0} /></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center"><Calendar className="mr-1 h-4 w-4" />{new Date(project.startDate).toLocaleDateString()}</div>
                    {project.budget && (<div className="flex items-center"><DollarSign className="mr-1 h-4 w-4" />${project.budget.toLocaleString()}</div>)}
                  </div>
              </Link>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Create New Project</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input {...register('title', { required: true })} placeholder="Project Title" className="w-full border rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              <input {...register('client', { required: true })} placeholder="Client Name" className="w-full border rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              <textarea {...register('description')} placeholder="Description" className="w-full border rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" {...register('startDate')} className="border rounded p-2" />
                <input type="date" {...register('endDate')} className="border rounded p-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" {...register('budget')} placeholder="Budget" className="border rounded p-2" />
                <select {...register('status')} className="border rounded p-2">
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                </select>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Thumbnail</label>
                  <label className="flex items-center justify-center border-2 border-dashed border-gray-300 p-4 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                      {uploading ? <Loader2 className="animate-spin mr-2"/> : <Upload className="mr-2"/>}
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  </label>
                  {thumbnailUrl && <p className="text-xs text-green-600 mt-1 font-medium">Image Uploaded Successfully</p>}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal Component */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={confirmAction} 
        title={confirmTitle} 
        message={confirmMessage} 
      />
    </div>
  );
}