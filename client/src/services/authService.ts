import api from './api';
import type { User } from '../utils/types';

export const authService = {
  register: (data: { name: string; email: string; password: string; userRole?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.put('/auth/profile', data),
};
