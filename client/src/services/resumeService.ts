import api from './api';

export const resumeService = {
  upload: (formData: FormData) =>
    api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getAll: () => api.get('/resume'),

  getById: (id: string) => api.get(`/resume/${id}`),

  matchJob: (id: string, data: { jobTitle: string; company: string; jobDescription: string }) =>
    api.post(`/resume/${id}/match`, data),

  delete: (id: string) => api.delete(`/resume/${id}`),
};
