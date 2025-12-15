'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import SprintModal from '@/components/SprintModal';
import TaskModal from '@/components/TaskModal';
import TaskDetailsModal from '@/components/TaskDetailsModal';
import KanbanBoard from '@/components/KanbanBoard';
import ConfirmModal from '@/components/ConfirmModal'; // Import ConfirmModal
import { Plus, Clock, User as UserIcon, Trash2, Edit, LayoutList, Kanban } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  // View Mode: 'list' or 'board'
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  // Modals States
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  // Confirm Modal States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  const fetchProjectData = useCallback(async () => {
    try {
      if(!id) return;
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);
      const sprintsRes = await api.get(`/sprints/${id}`);
      setSprints(sprintsRes.data);
      const tasksRes = await api.get(`/tasks?projectId=${id}`);
      setTasks(tasksRes.data);
    } catch (error) { console.error(error); }
  }, [id]);

  useEffect(() => { fetchProjectData(); }, [fetchProjectData]);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic Update
    const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated');
      fetchProjectData(); 
    } catch (error) { toast.error('Failed to update status'); fetchProjectData(); }
  };

  // --- Delete Handlers with Confirm Modal ---

  const handleDeleteSprint = (sprintId: string) => {
    // 1. Set the action to perform
    setConfirmAction(() => async () => {
        try {
            await api.delete(`/sprints/${sprintId}`);
            toast.success('Sprint deleted');
            fetchProjectData();
        } catch (error) {
            toast.error('Failed to delete sprint');
        }
    });
    // 2. Set Text
    setConfirmTitle('Delete Sprint');
    setConfirmMessage('Are you sure you want to delete this sprint? All tasks within it will be permanently removed.');
    // 3. Open Modal
    setConfirmOpen(true);
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); // Stop bubbling
    
    setConfirmAction(() => async () => {
        try {
            await api.delete(`/tasks/${taskId}`);
            toast.success('Task deleted');
            fetchProjectData();
        } catch (error) {
            toast.error('Failed to delete task');
        }
    });

    setConfirmTitle('Delete Task');
    setConfirmMessage('Are you sure you want to delete this task? This action cannot be undone.');
    setConfirmOpen(true);
  };

  // ------------------------------------------

  const handleEditSprint = (sprint: any) => { setSprintToEdit(sprint); setIsSprintModalOpen(true); };
  
  const handleTaskClick = (task: any) => { setSelectedTask(task); setIsTaskDetailsOpen(true); };
  
  const openTaskModal = (sprintId: string) => { setSelectedSprintId(sprintId); setIsTaskModalOpen(true); };

  if (!project) return <div className="p-8">Loading...</div>;
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between">
            <div><h1 className="text-3xl font-bold">{project.title}</h1><p className="text-gray-500">{project.client}</p></div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">{project.status}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">Tasks</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="List View"
                >
                    <LayoutList size={18}/>
                </button>
                <button 
                    onClick={() => setViewMode('board')} 
                    className={`p-2 rounded ${viewMode === 'board' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Board View"
                >
                    <Kanban size={18}/>
                </button>
            </div>
        </div>
        {isAdminOrManager && (
             <button onClick={() => { setSprintToEdit(null); setIsSprintModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> Add Sprint
            </button>
        )}
      </div>

      {/* Main Content: Board or List */}
      {viewMode === 'board' ? (
        <KanbanBoard tasks={tasks} onStatusChange={updateTaskStatus} onTaskClick={handleTaskClick} />
      ) : (
        <div className="space-y-6">
            {sprints.map((sprint) => (
            <div key={sprint._id} className="bg-white rounded-lg shadow border border-gray-200">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <div><h3 className="font-semibold">{sprint.title}</h3><p className="text-xs text-gray-500">Sprint #{sprint.sprintNumber}</p></div>
                    {isAdminOrManager && (
                        <div className="flex gap-2">
                            <button onClick={() => handleEditSprint(sprint)} className="text-gray-400 hover:text-indigo-600" title="Edit Sprint"><Edit size={16}/></button>
                            <button onClick={() => handleDeleteSprint(sprint._id)} className="text-gray-400 hover:text-red-600" title="Delete Sprint"><Trash2 size={16}/></button>
                            <button onClick={() => openTaskModal(sprint._id)} className="text-indigo-600 text-sm flex items-center border-l pl-2"><Plus size={16}/> Add Task</button>
                        </div>
                    )}
                </div>
                <div className="divide-y">
                    {tasks.filter(t => t.sprint?._id === sprint._id).map((task) => (
                        <div key={task._id} onClick={() => handleTaskClick(task)} className="p-4 hover:bg-gray-50 flex justify-between cursor-pointer group">
                            <div className="flex-1">
                                <div className="flex items-center"><span className={`w-2 h-2 rounded-full mr-2 ${task.priority==='high'?'bg-red-500':'bg-green-500'}`}></span><h4 className="font-medium">{task.title}</h4></div>
                                <div className="ml-4 text-xs text-gray-500 flex gap-3 mt-1"><span className="flex items-center"><UserIcon size={12} className="mr-1"/> {task.assignees?.[0]?.name}</span><span>Est: {task.estimate}h</span></div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div onClick={e=>e.stopPropagation()}><select value={task.status} onChange={(e) => updateTaskStatus(task._id, e.target.value)} className="text-sm border-none bg-gray-100 rounded-full px-2 py-1"><option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="review">Review</option><option value="done">Done</option></select></div>
                                {isAdminOrManager && <button onClick={(e) => handleDeleteTask(e, task._id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>}
                            </div>
                        </div>
                    ))}
                    {tasks.filter(t => t.sprint?._id === sprint._id).length === 0 && <div className="p-4 text-center text-sm text-gray-400">No tasks</div>}
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Modals */}
      <SprintModal isOpen={isSprintModalOpen} onClose={() => setIsSprintModalOpen(false)} projectId={id as string} onSuccess={fetchProjectData} sprintToEdit={sprintToEdit} />
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} projectId={id as string} sprintId={selectedSprintId} onSuccess={fetchProjectData} />
      <TaskDetailsModal task={selectedTask} isOpen={isTaskDetailsOpen} onClose={() => setIsTaskDetailsOpen(false)} onUpdate={fetchProjectData} />
      
      {/* Confirm Modal */}
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