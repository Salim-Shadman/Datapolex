import { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services/taskService';
import toast from 'react-hot-toast';

export function useTasks(projectId: string | undefined) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      
      const data = await taskService.getAll({ projectId, limit: 1000 });
      setTasks(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load tasks');
      toast.error('Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

 
  const updateTaskStatusOptimistic = async (taskId: string, newStatus: string) => {
    
    const originalTasks = [...tasks];

    
    setTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
        
        await taskService.update(taskId, { status: newStatus });
    } catch (err) {
        
        console.error("Update failed, reverting:", err);
        setTasks(originalTasks);
        toast.error("Failed to move task");
    }
  };

  return { 
    tasks, 
    loading, 
    error, 
    refetch: fetchTasks, 
    setTasks,
    updateTaskStatusOptimistic 
  };
}