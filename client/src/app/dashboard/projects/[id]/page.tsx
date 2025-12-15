'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, DollarSign, Trash2, Edit, ChevronRight, LayoutList } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Components
import SprintList from '@/components/SprintList';
import TaskBoard from '@/components/TaskBoard';
import EditProjectModal from '@/components/EditProjectModal';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'board' | 'sprints'>('board');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      toast.error('Failed to load project details');
      router.push('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This will delete all sprints and tasks!')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      router.push('/dashboard/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleProjectUpdate = (updatedProject: any) => {
    setProject(updatedProject);
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center text-gray-500">Loading Project...</div>;
  if (!project) return null;

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex-shrink-0">
         <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex gap-5">
                {/* Project Thumbnail */}
                <div className="h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                             <LayoutList size={24}/>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href="/dashboard/projects" className="hover:text-indigo-600">Projects</Link>
                        <ChevronRight size={14}/>
                        <span>{project.client}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{project.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                            project.status === 'active' ? 'bg-green-100 text-green-700' : 
                            project.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                            {project.status}
                        </span>
                        <span className="flex items-center"><Calendar size={14} className="mr-1"/> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                        {project.budget > 0 && (
                            <span className="flex items-center font-medium text-gray-900"><DollarSign size={14} className="mr-1 text-gray-400"/> {project.budget.toLocaleString()}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                 {isAdminOrManager && (
                    <button 
                        onClick={() => setIsEditOpen(true)}
                        className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition"
                    >
                        <Edit size={16} className="mr-2"/> Edit
                    </button>
                 )}
                 
                 {isAdminOrManager && (
                    <button 
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Project"
                    >
                        <Trash2 size={20}/>
                    </button>
                 )}
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center gap-6 mt-6 border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('board')}
                className={`pb-3 text-sm font-medium border-b-2 transition ${activeTab === 'board' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Task Board
            </button>
            <button 
                onClick={() => setActiveTab('sprints')}
                className={`pb-3 text-sm font-medium border-b-2 transition ${activeTab === 'sprints' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Sprints & Timeline
            </button>
         </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-x-auto bg-gray-50 p-6">
        {activeTab === 'board' ? (
            <TaskBoard projectId={id as string} />
        ) : (
            <SprintList projectId={id as string} />
        )}
      </div>

      {/* Edit Modal */}
      {isAdminOrManager && (
        <EditProjectModal 
            isOpen={isEditOpen} 
            onClose={() => setIsEditOpen(false)} 
            project={project}
            onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
}