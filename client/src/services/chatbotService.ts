import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatSession {
  _id: string;
  title: string;
  messages: ChatMessage[];
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const chatbotService = {
  sendMessage: (message: string, chatId?: string) =>
    api.post('/chatbot/message', { message, chatId }),

  getSessions: () => api.get('/chatbot/sessions'),

  getSession: (id: string) => api.get(`/chatbot/session/${id}`),

  saveSession: (id: string) => api.patch(`/chatbot/session/${id}/save`),

  deleteSession: (id: string) => api.delete(`/chatbot/session/${id}`),

  clearAllSessions: () => api.delete('/chatbot/sessions'),

  enhancePrompt: (prompt: string) => api.post('/chatbot/enhance-prompt', { prompt }),
};
