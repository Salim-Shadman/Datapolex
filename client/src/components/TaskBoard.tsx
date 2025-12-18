'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, LayoutGrid, List as ListIcon, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import KanbanBoard from './KanbanBoard';
import TaskModal from './TaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import { useAuth } from '@/context/AuthContext';
import { taskService } from '@/services/taskService';
import api from '@/utils/api';

export default function TaskBoard({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterSprint, setFilterSprint] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // FIX: AbortController Ref for Race Conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch Filters (Sprints & Users)
  useEffect(() => {
    let isMounted = true;
    const fetchFilters = async () => {
        try {
            const [sprintRes, userRes] = await Promise.all([
                api.get(`/sprints?projectId=${projectId}`),
                // Optimization: Fetch simplified user list
                api.get('/users?simple=true') 
            ]);
            if (isMounted) {
                setSprints(sprintRes.data);
                setUsers(userRes.data);
            }
        } catch (e) { console.error(e); }
    };
    fetchFilters();
    return () => { isMounted = false; };
  }, [projectId]);

  const fetchTasks = useCallback(async () => {
    // 1. Cancel previous pending request
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    
    // 2. Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const filters: any = { projectId };
      if (filterSprint) filters.sprintId = filterSprint;
      if (filterAssignee) filters.assignee = filterAssignee;
      if (filterPriority) filters.priority = filterPriority;

      // Note: Typically pass controller.signal to api calls, 
      // but here we check aborted status before setting state
      const data = await taskService.getAll(filters);
      
      if (!controller.signal.aborted) {
         setTasks(data);
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && !controller.signal.aborted) {
          console.error(error);
          toast.error('Failed to load tasks');
      }
    } finally {
      if (!controller.signal.aborted) {
          setLoading(false);
      }
    }
  }, [projectId, filterSprint, filterAssignee, filterPriority]);

  useEffect(() => {
    fetchTasks();
    return () => {
        // Cleanup on unmount
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Optimistic UI Update
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map(t => 
        t._id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
        await taskService.update(taskId, { status: newStatus });
    } catch (error) {
        toast.error('Failed to update status');
        setTasks(previousTasks); // Revert on error
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="h-full flex flex-col">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        
        {/* View Toggles & Title */}
        <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-gray-800">Task Board</h3>
            <div className="bg-gray-100 p-1 rounded-lg flex text-gray-500">
                <button 
                    onClick={() => setViewMode('board')}
                    className={`p-1.5 rounded-md transition ${viewMode === 'board' ? 'bg-white shadow-sm text-indigo-600' : 'hover:text-gray-700'}`}
                    title="Kanban Board"
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'hover:text-gray-700'}`}
                    title="List View"
                >
                    <ListIcon size={18} />
                </button>
            </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm">
                <Filter size={14} className="text-gray-400"/>
                
                <select 
                    value={filterSprint} 
                    onChange={e => setFilterSprint(e.target.value)}
                    className="text-sm bg-transparent border-none focus:ring-0 text-gray-600 cursor-pointer outline-none"
                >
                    <option value="">All Sprints</option>
                    {sprints.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                </select>

                <div className="w-px h-4 bg-gray-200 mx-1"></div>

                <select 
                    value={filterAssignee} 
                    onChange={e => setFilterAssignee(e.target.value)}
                    className="text-sm bg-transparent border-none focus:ring-0 text-gray-600 cursor-pointer outline-none"
                >
                    <option value="">All Assignees</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>

                <div className="w-px h-4 bg-gray-200 mx-1"></div>

                <select 
                    value={filterPriority} 
                    onChange={e => setFilterPriority(e.target.value)}
                    className="text-sm bg-transparent border-none focus:ring-0 text-gray-600 cursor-pointer outline-none"
                >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            {isAdminOrManager && (
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition ml-auto md:ml-0"
                >
                    <Plus size={16} className="mr-2"/> New Task
                </button>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
         {loading ? (
             <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
         ) : viewMode === 'board' ? (
             <KanbanBoard 
                tasks={tasks} 
                onStatusChange={handleStatusChange} 
                onTaskClick={handleTaskClick} 
             />
         ) : (
             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full overflow-y-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                         <tr>
                             <th className="px-6 py-3">Task</th>
                             <th className="px-6 py-3">Status</th>
                             <th className="px-6 py-3">Priority</th>
                             <th className="px-6 py-3">Assignee</th>
                             <th className="px-6 py-3">Due Date</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {tasks.length === 0 ? (
                             <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No tasks found</td></tr>
                         ) : tasks.map(task => (
                             <tr key={task._id} onClick={() => handleTaskClick(task)} className="hover:bg-gray-50 cursor-pointer transition">
                                 <td className="px-6 py-3 font-medium text-gray-900">{task.title}</td>
                                 <td className="px-6 py-3">
                                     <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                         task.status === 'done' ? 'bg-green-100 text-green-700' : 
                                         task.status === 'review' ? 'bg-purple-100 text-purple-700' : 
                                         task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                     }`}>{task.status}</span>
                                 </td>
                                 <td className="px-6 py-3">
                                     <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                         task.priority === 'high' ? 'text-red-600 bg-red-50' : 
                                         task.priority === 'medium' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'
                                     }`}>{task.priority}</span>
                                 </td>
                                 <td className="px-6 py-3 text-gray-600">{task.assignees?.[0]?.name || '-'}</td>
                                 <td className="px-6 py-3 text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         )}
      </div>

      <TaskModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        projectId={projectId}
        sprintId={filterSprint || null} 
        onSuccess={fetchTasks}
      />

      {selectedTask && (
        <TaskDetailsModal 
            isOpen={isDetailsOpen} 
            onClose={() => { setIsDetailsOpen(false); setSelectedTask(null); }} 
            task={selectedTask}
            onUpdate={fetchTasks}
        />
      )}
    </div>
  );
}