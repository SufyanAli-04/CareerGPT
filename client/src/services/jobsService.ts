import api from './api';

export interface JobMatchRequest {
	skills: string[];
	targetRole: string;
	experience: number;
}

export interface JobMatchResult {
	id: string;
	title: string;
	company: string;
	location: string;
	category: 'Web Development' | 'AI / ML' | 'Mobile Development';
	skills: string[];
	description: string;
	requirements: string[];
	salary?: string;
	matchScore: number;
	explanation: string;
	matchedSkills: string[];
}

export interface ResumeJobProfile {
	skills: string[];
	targetRole: string;
	experience: number;
}

export const jobsService = {
	getResumeProfile: () => api.get<{ success: boolean; profile: ResumeJobProfile }>('/jobs/resume-profile'),
	matchJobs: (payload: JobMatchRequest) =>
		api.post<{ success: boolean; total: number; jobs: JobMatchResult[] }>('/jobs/match', payload),
};
