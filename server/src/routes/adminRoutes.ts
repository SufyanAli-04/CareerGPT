import { Router } from 'express';
import protect, { admin } from '../middleware/authMiddleware';
import {
  getDashboardStats,
  getGrowthAnalytics,
  getFeatureUsage,
  getUsers,
  toggleSuspendUser,
  deleteUser,
  getJobListings,
  addJobListing,
  editJobListing,
  deleteJobListing,
  getAdminBookings,
  cancelBooking,
} from '../controllers/adminController';

const router = Router();

// Apply auth protection & admin role check globally to all admin routes
router.use(protect);
router.use(admin);

// Metrics
router.get('/dashboard-stats', getDashboardStats);
router.get('/growth-analytics', getGrowthAnalytics);
router.get('/feature-usage', getFeatureUsage);

// Users Management
router.get('/users', getUsers);
router.put('/users/:id/suspend', toggleSuspendUser);
router.delete('/users/:id', deleteUser);

// Self-Jobs DB Management (Job Listings)
router.get('/job-listings', getJobListings);
router.post('/job-listings', addJobListing);
router.put('/job-listings/:id', editJobListing);
router.delete('/job-listings/:id', deleteJobListing);

// Session Bookings Management
router.get('/bookings', getAdminBookings);
router.put('/bookings/:id/cancel', cancelBooking);

export default router;
