import api from './api';

export const notesService = {
  create: (data: { title: string; content: string; tags?: string[]; category?: string }) =>
    api.post('/notes', data),

  getAll: (params?: { search?: string; category?: string }) =>
    api.get('/notes', { params }),

  analyze: (data: { title: string; content: string }) =>
    api.post('/notes/analyze', data),

  getById: (id: string) => api.get(`/notes/${id}`),

  update: (id: string, data: Partial<{ title: string; content: string; tags: string[]; category: string }>) =>
    api.put(`/notes/${id}`, data),

  enhance: (id: string) => api.post(`/notes/${id}/enhance`),

  delete: (id: string) => api.delete(`/notes/${id}`),
};
export default notesService;
