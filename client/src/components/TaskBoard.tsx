'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import KanbanBoard from './KanbanBoard'; // Drag & Drop Board
import TaskModal from './TaskModal'; // Create Task
import TaskDetailsModal from './TaskDetailsModal'; // View/Edit/Timer
import { useAuth } from '@/context/AuthContext';

export default function TaskBoard({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // Handle Drag & Drop Status Change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Optimistic Update (UI change immediately)
    const updatedTasks = tasks.map(t => 
        t._id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
        await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
        toast.error('Failed to update status');
        fetchTasks(); // Revert on error
    }
  };

  // Open Details Modal
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  if (loading) return <div className="text-center py-10">Loading Board...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 px-1">
        <h3 className="text-lg font-bold text-gray-800">Task Board</h3>
        {isAdminOrManager && (
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition"
            >
                <Plus size={16} className="mr-2"/> New Task
            </button>
        )}
      </div>

      {/* Kanban Board Component */}
      <div className="flex-1 overflow-hidden">
         <KanbanBoard 
            tasks={tasks} 
            onStatusChange={handleStatusChange} 
            onTaskClick={handleTaskClick} 
         />
      </div>

      {/* Create Task Modal */}
      <TaskModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        projectId={projectId}
        sprintId={null} // Default to Backlog
        onSuccess={fetchTasks}
      />

      {/* Task Details Modal (Timer, Comments, etc.) */}
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