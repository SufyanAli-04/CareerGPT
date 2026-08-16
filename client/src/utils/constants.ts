export const APP_NAME = 'CareerGPT';
export const API_BASE = '/api';

export const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Resume', path: '/resume', icon: 'resume' },
  { label: 'Jobs', path: '/jobs', icon: 'jobs' },
  { label: 'Chatbot', path: '/chatbot', icon: 'chatbot' },
  { label: 'Interview', path: '/interview', icon: 'interview' },
  { label: 'Roadmap', path: '/roadmap', icon: 'roadmap' },
  { label: 'Notes', path: '/notes', icon: 'notes' },
];

export const INTERVIEW_TYPES = ['HR', 'Technical', 'Behavioral'] as const;
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const NOTE_CATEGORIES = ['General', 'Career', 'Technical', 'Interview', 'Roadmap', 'Other'];

export const SCORE_COLORS = {
  high: '#4ade80',
  medium: '#fbbf24',
  low: '#f87171',
};
