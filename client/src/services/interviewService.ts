import api from './api';

export interface InterviewQuestion {
  _id?: string;
  question: string;
  sampleAnswer?: string;
  userAnswer?: string;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}

export interface Interview {
  _id: string;
  role: string;
  type: string;
  difficulty: string;
  questions: InterviewQuestion[];
  overallScore?: number;
  completedAt?: string;
  createdAt: string;
}

export const interviewService = {
  // Generate questions and create a new interview session
  generateQuestions: async (data: { role: string; type: string; difficulty: string }) => {
    const response = await api.post('/interview/generate', data);
    return response.data; // { success, interview }
  },

  // Submit an answer for AI evaluation
  evaluateAnswer: async (id: string, questionIndex: number, userAnswer: string) => {
    const response = await api.post(`/interview/${id}/evaluate`, { questionIndex, userAnswer });
    return response.data; // { success, evaluation, interview }
  },

  // End the interview and calculate overall score
  endInterview: async (id: string) => {
    const response = await api.post(`/interview/${id}/end`);
    return response.data; // { success, interview }
  },

  // Get all interview history
  getInterviews: async () => {
    const response = await api.get('/interview');
    return response.data; // { success, interviews }
  },

  // Get a single interview
  getInterviewById: async (id: string) => {
    const response = await api.get(`/interview/${id}`);
    return response.data; // { success, interview }
  },

  // Delete an interview
  deleteInterview: async (id: string) => {
    const response = await api.delete(`/interview/${id}`);
    return response.data; // { success }
  },
};
