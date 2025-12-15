'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Calendar, DollarSign, Trash2, Search, Upload, Loader2, Image as ImageIcon, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProgressBar from '@/components/ProgressBar';
import ConfirmModal from '@/components/ConfirmModal';
import ProjectThumbnail from '@/components/ProjectThumbnail'; // New Import

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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault(); 
    e.stopPropagation(); 

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
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center"><Briefcase className="mr-2 text-indigo-600"/> Projects</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your active projects and progress.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by Client..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-9 w-full rounded-lg border border-gray-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
                />
            </div>
            <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="rounded-lg border border-gray-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white"
            >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
            </select>
            {isAdminOrManager && (
                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-md transition-all">
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project._id} className="relative group block rounded-xl bg-white shadow-sm hover:shadow-xl border border-gray-200 h-full overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
              {/* Thumbnail with Error Handling */}
              <ProjectThumbnail 
                src={project.thumbnail} 
                alt={project.title} 
                className="h-40 w-full"
              >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                  <span className={`absolute bottom-3 left-3 px-2 py-1 text-xs rounded-full font-bold uppercase tracking-wider backdrop-blur-md 
                    ${project.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                    {project.status}
                  </span>
                  
                  {isAdminOrManager && (
                    <button 
                        onClick={(e) => handleDeleteClick(e, project._id)} 
                        className="absolute top-2 right-2 p-2 bg-white/90 text-gray-500 hover:text-red-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        title="Delete Project"
                    >
                        <Trash2 size={16} />
                    </button>
                  )}
              </ProjectThumbnail>

              <Link href={`/dashboard/projects/${project._id}`} className="block p-5">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-1 transition-colors">{project.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">{project.client}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
                        <span>Progress</span>
                        <span>{Math.round(project.progress || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                            className="h-2 rounded-full bg-indigo-600 transition-all duration-1000" 
                            style={{ width: `${project.progress || 0}%` }}
                        ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center"><Calendar className="mr-1.5 h-3.5 w-3.5" />{new Date(project.startDate).toLocaleDateString()}</div>
                    {project.budget && (<div className="flex items-center font-medium text-gray-700"><DollarSign className="mr-1 h-3.5 w-3.5" />{project.budget.toLocaleString()}</div>)}
                  </div>
              </Link>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-6 text-xl font-bold text-gray-900 border-b pb-2">Create New Project</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Details</label>
                <div className="space-y-3">
                    <input {...register('title', { required: true })} placeholder="Project Title" className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 border" />
                    <input {...register('client', { required: true })} placeholder="Client Name" className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 border" />
                    <textarea {...register('description')} placeholder="Description" rows={3} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                    <input type="date" {...register('startDate')} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" {...register('endDate')} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                    <input type="number" {...register('budget')} className="w-full border-gray-300 rounded-lg p-2.5 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select {...register('status')} className="w-full border-gray-300 rounded-lg p-2.5 border">
                        <option value="planned">Planned</option>
                        <option value="active">Active</option>
                    </select>
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Thumbnail</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-500 transition-all group">
                      {uploading ? <Loader2 className="animate-spin text-indigo-600 mb-2"/> : <Upload className="text-gray-400 group-hover:text-indigo-600 mb-2"/>}
                      <span className="text-sm text-gray-500 group-hover:text-indigo-600">{uploading ? 'Uploading...' : 'Click to Upload Image'}</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  </label>
                  {thumbnailUrl && <p className="text-xs text-green-600 mt-2 font-medium flex items-center"><ImageIcon size={12} className="mr-1"/> Image Attached</p>}
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition">Cancel</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition disabled:opacity-70">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

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