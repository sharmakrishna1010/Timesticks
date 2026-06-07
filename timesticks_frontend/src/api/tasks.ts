import api from './axios.js';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  done: boolean;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  list: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  listId?: string;
}

export const tasksApi = {
  getAll: () => api.get<Task[]>('/task/'),
  create: (data: CreateTaskData) => api.post<Task>('/task/create', data),
  update: (taskId: string, data: Partial<CreateTaskData>) => api.put<Task>(`/task/${taskId}`, data),
  toggle: (taskId: string) => api.patch<Task>(`/task/${taskId}/toggle`),
  delete: (taskId: string) => api.delete(`/task/${taskId}`),
};
