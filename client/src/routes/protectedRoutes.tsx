import type { RouteConfigItem } from './routeTypes';

import MainLayout from '../components/Layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Resume from '../pages/Resume';
import Jobs from '../pages/Jobs';
import Chatbot from '../pages/Chatbot';
import Interview from '../pages/Interview';
import Roadmap from '../pages/Roadmap';
import Notes from '../pages/Notes';
import HowItWorks from '../pages/HowItWorks';
import Profile from '../pages/Profile';
import Pricing from '../pages/Pricing';
import Onboarding from '../pages/Onboarding';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminJobs from '../pages/Admin/AdminJobs';
import AdminBookings from '../pages/Admin/AdminBookings';

export const protectedRouteConfig: RouteConfigItem[] = [
  { path: '/dashboard', element: <MainLayout><Dashboard /></MainLayout> },
  { path: '/resume', element: <MainLayout><Resume /></MainLayout> },
  { path: '/jobs', element: <MainLayout><Jobs /></MainLayout> },
  { path: '/chatbot', element: <MainLayout><Chatbot /></MainLayout> },
  { path: '/interview', element: <MainLayout><Interview /></MainLayout> },
  { path: '/roadmap', element: <MainLayout><Roadmap /></MainLayout> },
  { path: '/notes', element: <MainLayout><Notes /></MainLayout> },
  { path: '/how-it-works', element: <MainLayout><HowItWorks /></MainLayout> },
  { path: '/profile', element: <MainLayout><Profile /></MainLayout> },
  { path: '/settings', element: <MainLayout><Profile /></MainLayout> },
  { path: '/pricing', element: <Pricing /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/admin/dashboard', element: <MainLayout><AdminDashboard /></MainLayout> },
  { path: '/admin/users', element: <MainLayout><AdminUsers /></MainLayout> },
  { path: '/admin/jobs', element: <MainLayout><AdminJobs /></MainLayout> },
  { path: '/admin/bookings', element: <MainLayout><AdminBookings /></MainLayout> },
];
