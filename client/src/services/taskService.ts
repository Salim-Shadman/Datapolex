import api from '@/utils/api'; // আপনার api utility import করুন

// Types define করা ভালো (Optional but Recommended)
interface TaskFilter {
  projectId?: string;
  sprintId?: string;
  status?: string;
  assigneeId?: string;
}

export const taskService = {
  // সব টাস্ক আনা
  getAll: async (filters: TaskFilter = {}) => {
    const params = new URLSearchParams();
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.sprintId) params.append('sprintId', filters.sprintId);
    if (filters.status) params.append('status', filters.status);
    
    const { data } = await api.get('/tasks', { params });
    return data;
  },

  // নতুন টাস্ক তৈরি
  create: async (taskData: any) => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  },

  // টাস্ক আপডেট (Status বা অন্যান্য)
  update: async (id: string, updateData: any) => {
    const { data } = await api.put(`/tasks/${id}`, updateData);
    return data;
  },

  // টাস্ক ডিলিট
  delete: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  }
};