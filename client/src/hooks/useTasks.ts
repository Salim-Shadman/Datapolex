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
      // FIX 1: Limit increased to 1000 for Kanban Board to avoid pagination cutting off tasks
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

  // FIX 2: Optimistic Update Helper for Drag & Drop
  // সার্ভারে রিকোয়েস্ট যাওয়ার আগেই UI আপডেট করে দেবে, যাতে অ্যাপ ফাস্ট মনে হয়
  const updateTaskStatusOptimistic = async (taskId: string, newStatus: string) => {
    // 1. Backup current state
    const originalTasks = [...tasks];

    // 2. Update UI Immediately
    setTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
        // 3. Call Server API
        await taskService.update(taskId, { status: newStatus });
    } catch (err) {
        // 4. Revert if API fails
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
    updateTaskStatusOptimistic // New helper exported
  };
}