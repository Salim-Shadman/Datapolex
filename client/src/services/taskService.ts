import api from '@/utils/api';

export interface TaskFilter {
  projectId?: string;
  sprintId?: string;
  status?: string;
  assignee?: string;
  priority?: string;
 
  page?: number;
  limit?: number;
}

export const taskService = {
  
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

  
  create: async (taskData: any) => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  },

  
  update: async (id: string, updateData: any) => {
    const { data } = await api.put(`/tasks/${id}`, updateData);
    return data;
  },

  
  delete: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },

  
  addComment: async (id: string, text: string) => {
    const { data } = await api.post(`/tasks/${id}/comments`, { text });
    return data;
  },

  
  logTime: async (id: string, hours: number) => {
    const { data } = await api.post(`/tasks/${id}/log-time`, { hours });
    return data;
  },

  
  toggleTimer: async (id: string) => {
    const { data } = await api.post(`/tasks/${id}/timer`);
    return data;
  }
};