import api from './axios.js';

export interface List {
  _id: string;
  title: string;
  isDefault: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export const listsApi = {
  getAll: () => api.get<List[]>('/list/'),
  create: (title: string) => api.post<List>('/list/create', { title }),
  update: (listId: string, title: string) => api.put<List>(`/list/${listId}`, { title }),
  delete: (listId: string, deleteAllTasks = false) =>
    api.delete(`/list/${listId}?deleteAllTasks=${deleteAllTasks}`),
};
