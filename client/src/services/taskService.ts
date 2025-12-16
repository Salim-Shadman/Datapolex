import api from '@/utils/api';

export interface TaskFilter {
  projectId?: string;
  sprintId?: string;
  status?: string;
  assignee?: string;
  priority?: string;
  // Pagination Support Added
  page?: number;
  limit?: number;
}

export const taskService = {
  // Get All Tasks (Supports Filtering & Pagination)
  getAll: async (filters: TaskFilter = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const { data } = await api.get('/tasks', { params });
    return data;
  },

  // Create Task
  create: async (taskData: any) => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  },

  // Update Task
  update: async (id: string, updateData: any) => {
    const { data } = await api.put(`/tasks/${id}`, updateData);
    return data;
  },

  // Delete Task
  delete: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },

  // Add Comment
  addComment: async (id: string, text: string) => {
    const { data } = await api.post(`/tasks/${id}/comments`, { text });
    return data;
  },

  // Log Time
  logTime: async (id: string, hours: number) => {
    const { data } = await api.post(`/tasks/${id}/log-time`, { hours });
    return data;
  },

  // Toggle Timer
  toggleTimer: async (id: string) => {
    const { data } = await api.post(`/tasks/${id}/timer`);
    return data;
  }
};