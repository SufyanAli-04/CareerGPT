// ─── Auth Types ───────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  currentRole?: string;
  targetRole?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  userRole?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  language?: string;
  theme?: string;
  plan?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ─── Resume Types ─────────────────────────────────────────────────────────────
export interface AIAnalysis {
  overallScore: number;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  atsScore: number;
}

export interface JobMatch {
  jobTitle: string;
  company: string;
  description: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
}

export interface Resume {
  _id: string;
  fileName: string;
  rawText: string;
  aiAnalysis?: AIAnalysis;
  jobMatches?: JobMatch[];
  createdAt: string;
}

// ─── Interview Types ──────────────────────────────────────────────────────────
export type InterviewType = 'HR' | 'Technical' | 'Behavioral';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface InterviewQuestion {
  question: string;
  sampleAnswer?: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
}

export interface Interview {
  _id: string;
  role: string;
  type: InterviewType;
  difficulty: Difficulty;
  questions: InterviewQuestion[];
  overallScore?: number;
  performanceSummary?: string;
  completedAt?: string;
  createdAt: string;
}

// ─── Notes Types ──────────────────────────────────────────────────────────────
export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  aiSummary?: string;
  aiKeyTakeaways?: string[];
  aiActionItems?: string[];
  relatedTopics?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Roadmap Types ────────────────────────────────────────────────────────────
export interface RoadmapResource {
  name: string;
  type: string;
  url?: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  skills: string[];
  resources: RoadmapResource[];
  milestones: string[];
  completed: boolean;
}

export interface Roadmap {
  _id: string;
  targetRole: string;
  timeframe: string;
  currentSkills: string[];
  skillGap: { have: string[]; missing: string[] };
  phases: RoadmapPhase[];
  overallProgress: number;
  createdAt: string;
}

// ─── Chat Types ───────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
