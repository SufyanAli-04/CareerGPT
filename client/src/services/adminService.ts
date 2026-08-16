import api from './api';

export interface UserActivity {
  resumes: number;
  interviews: number;
  roadmaps: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  userRole: string;
  plan: string;
  suspended: boolean;
  createdAt: string;
  activity: UserActivity;
}

export interface JobListing {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: 'Web Development' | 'AI / ML' | 'Mobile Development';
  skills: string[];
  description: string;
  requirements: string[];
  salary?: string;
  createdAt: string;
}

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),

  getGrowthAnalytics: () => api.get('/admin/growth-analytics'),

  getFeatureUsage: () => api.get('/admin/feature-usage'),

  getUsers: (search = '', page = 1, limit = 10) =>
    api.get('/admin/users', { params: { search, page, limit } }),

  toggleSuspendUser: (id: string) => api.put(`/admin/users/${id}/suspend`),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  getJobListings: (search = '', page = 1, limit = 10) =>
    api.get('/admin/job-listings', { params: { search, page, limit } }),

  addJobListing: (jobData: Omit<JobListing, '_id' | 'createdAt'>) =>
    api.post('/admin/job-listings', jobData),

  editJobListing: (id: string, jobData: Partial<JobListing>) =>
    api.put(`/admin/job-listings/${id}`, jobData),

  deleteJobListing: (id: string) => api.delete(`/admin/job-listings/${id}`),

  getAdminBookings: (status = 'all', search = '') =>
    api.get('/admin/bookings', { params: { status, search } }),

  cancelBooking: (id: string) => api.put(`/admin/bookings/${id}/cancel`),
};
export default adminService;
