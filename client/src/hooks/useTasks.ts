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
      const data = await taskService.getAll({ projectId });
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

  // যখনই projectId চেঞ্জ হবে, অটোমেটিক কল হবে
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { 
    tasks, 
    loading, 
    error, 
    refetch: fetchTasks, // ম্যানুয়ালি রিফ্রেশ করার জন্য
    setTasks // লোকাল স্টেট আপডেট করার জন্য (যেমন ড্র্যাগ-ড্রপ করলে)
  };
}