import api from './api';

export interface RoadmapStep {
  stepNumber: number;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  tasks: { title: string; completed: boolean }[];
  resources: { name: string; type: string; url?: string }[];
  completed: boolean;
}

export interface Roadmap {
  _id: string;
  targetRole: string;
  skillLevel: string;
  timeframe: string;
  summary: string;
  currentSkills: string[];
  skillGap: {
    have: string[];
    missing: string[];
  };
  steps: RoadmapStep[];
  overallProgress: number;
  createdAt: string;
}

export const generateRoadmap = async (data: { targetRole: string; timeframe: string; skillLevel: string }) => {
  const response = await api.post('/roadmap/generate', data);
  return response.data;
};

export const getRoadmaps = async () => {
  const response = await api.get('/roadmap');
  return response.data;
};

export const getRoadmapById = async (id: string) => {
  const response = await api.get(`/roadmap/${id}`);
  return response.data;
};

export const updateStepProgress = async (id: string, stepIndex: number, completed: boolean) => {
  const response = await api.patch(`/roadmap/${id}/step/${stepIndex}`, { completed });
  return response.data;
};

export const updateTaskProgress = async (id: string, stepIndex: number, taskIndex: number, completed: boolean) => {
  const response = await api.patch(`/roadmap/${id}/step/${stepIndex}/task/${taskIndex}`, { completed });
  return response.data;
};

export const deleteRoadmap = async (id: string) => {
  const response = await api.delete(`/roadmap/${id}`);
  return response.data;
};
