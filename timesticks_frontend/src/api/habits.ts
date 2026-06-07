import api from './axios.js';

export interface HabitHistoryEntry {
  date: string;      // 'YYYY-MM-DD'
  completed: boolean;
}

export interface Habit {
  _id: string;
  title: string;
  description?: string;
  currentStreak: number;
  highestStreak: number;
  todayStatus: boolean;
  history: HabitHistoryEntry[];
  user: string;
  createdAt: string;
  updatedAt: string;
}

export const habitsApi = {
  getAll: () => api.get<Habit[]>('/habit/'),
  create: (data: { title: string; description?: string }) =>
    api.post<Habit>('/habit/create', data),
  update: (habitId: string, data: { title: string; description?: string }) =>
    api.put<Habit>(`/habit/${habitId}`, data),
  toggle: (habitId: string) =>
    api.patch<{ message: string; habit: Habit }>(`/habit/${habitId}/toggle`),
  delete: (habitId: string) => api.delete(`/habit/${habitId}`),
};
