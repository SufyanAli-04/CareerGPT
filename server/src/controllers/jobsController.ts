import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import JobListing from '../models/JobListing';
import Resume from '../models/Resume';
import { jobSeedData } from '../data/jobSeed';
import { callOpenRouter, deriveResumeJobProfile, extractResumeJobProfile } from '../services/aiService';

type JobForScoring = {
	index: number;
	title: string;
	company: string;
	location: string;
	skills: string[];
	description: string;
	requirements: string[];
	salary?: string;
};

type AIMatch = {
	index: number;
	matchScore: number;
	explanation: string;
	matchedSkills?: string[];
};

const parseSkillsInput = (skills: unknown): string[] => {
	if (!Array.isArray(skills)) return [];

	const normalized = skills
		.map((s) => String(s).trim())
		.filter(Boolean)
		.map((s) => s.toLowerCase());

	return [...new Set(normalized)];
};

const clampScore = (score: number): number => {
	if (Number.isNaN(score)) return 0;
	return Math.max(0, Math.min(100, Math.round(score)));
};

const tokenize = (value: string): string[] =>
	value
		.toLowerCase()
		.split(/[^a-z0-9+#.]+/)
		.map((t) => t.trim())
		.filter((t) => t.length > 1);

const hasSkillOverlap = (jobSkills: string[], userSkills: string[]): boolean => {
	if (!jobSkills.length || !userSkills.length) return false;

	return userSkills.some((userSkill) =>
		jobSkills.some((jobSkill) => {
			const j = jobSkill.toLowerCase();
			return j.includes(userSkill) || userSkill.includes(j);
		})
	);
};

const hasRoleOverlap = (jobTitle: string, targetRole: string): boolean => {
	if (!targetRole.trim()) return false;

	const targetTokens = tokenize(targetRole);
	const titleTokens = tokenize(jobTitle);

	return targetTokens.some((targetToken) =>
		titleTokens.some((titleToken) =>
			titleToken.includes(targetToken) || targetToken.includes(titleToken)
		)
	);
};

const ensureJobSeeded = async (): Promise<void> => {
	const count = await JobListing.countDocuments();
	if (count > 0) return;
	await JobListing.insertMany(jobSeedData);
};

const parseJSONFromAI = (raw: string): Record<string, unknown> | null => {
	try {
		const cleaned = raw.replace(/```json|```/gi, '').trim();
		const firstObject = cleaned.indexOf('{');
		const firstArray = cleaned.indexOf('[');

		if (firstObject === -1 && firstArray === -1) return null;

		if (firstArray !== -1 && (firstObject === -1 || firstArray < firstObject)) {
			const lastArray = cleaned.lastIndexOf(']');
			if (lastArray === -1) return null;
			const parsed = JSON.parse(cleaned.slice(firstArray, lastArray + 1));
			return { matches: parsed as unknown[] };
		}

		const lastObject = cleaned.lastIndexOf('}');
		if (lastObject === -1) return null;
		return JSON.parse(cleaned.slice(firstObject, lastObject + 1)) as Record<string, unknown>;
	} catch (error) {
		console.error('Failed to parse AI response:', raw, error);
		return null;
	}
};

const scoreJobsWithAI = async (
	jobs: JobForScoring[],
	userSkills: string[],
	targetRole: string,
	experience: number
): Promise<AIMatch[]> => {
	if (!jobs.length) return [];

	const systemPrompt = 'You are a job matching AI. Return only raw JSON.';
	const userPrompt = `Score how well this candidate matches each job.

Candidate profile:
- skills: ${userSkills.join(', ')}
- targetRole: ${targetRole}
- experienceYears: ${experience}

Jobs:
${JSON.stringify(jobs)}

Return ONLY JSON in this exact shape:
{
	"matches": [
		{
			"index": 0,
			"matchScore": 0,
			"explanation": "short explanation",
			"matchedSkills": ["skill"]
		}
	]
}

Rules:
- matchScore must be an integer 0-100.
- Consider partial relevance: if at least one skill OR role intent aligns, score should generally be > 0.
- Role similarity should handle broad intent (example: frontend or developer can relate to frontend developer).
- Keep explanation under 25 words.
- Do not output markdown.`;

	try {
		const aiRaw = await callOpenRouter(systemPrompt, userPrompt);
		const parsed = parseJSONFromAI(aiRaw);

		if (parsed && Array.isArray(parsed.matches)) {
			return parsed.matches
				.map((item) => {
					const record = item as Record<string, unknown>;
					return {
						index: Number(record.index),
						matchScore: clampScore(Number(record.matchScore)),
						explanation: String(record.explanation || 'Potential fit based on available profile data.'),
						matchedSkills: Array.isArray(record.matchedSkills)
							? record.matchedSkills.map((skill) => String(skill))
							: [],
					};
				})
				.filter((item) => Number.isInteger(item.index) && item.index >= 0 && item.index < jobs.length);
		}

		// If AI returned invalid format, fall through to deterministic fallback below
		console.warn('AI returned invalid match format, using deterministic fallback scoring. Raw AI response logged for debugging.');
	} catch (err) {
		console.warn('AI scoring failed, using deterministic fallback scoring.', err instanceof Error ? err.message : err);
	}

	// Deterministic fallback scoring: simple heuristic based on skill overlap and role similarity
	const fallback: AIMatch[] = jobs.map((job) => {
		const matchedSkills: string[] = [];
		const jobSkills = (job.skills || []).map((s) => String(s).toLowerCase());
		const userSkillsNorm = userSkills.map((s) => String(s).toLowerCase());

		userSkillsNorm.forEach((us) => {
			jobSkills.forEach((js) => {
				if (js.includes(us) || us.includes(js)) {
					if (!matchedSkills.includes(js)) matchedSkills.push(js);
				}
			});
		});

		const skillScorePortion = userSkillsNorm.length ? (matchedSkills.length / Math.max(jobSkills.length, userSkillsNorm.length)) : 0;
		const roleMatch = hasRoleOverlap(job.title || '', targetRole);
		const score = clampScore(Math.round(skillScorePortion * 70 + (roleMatch ? 30 : 0)));

		return {
			index: job.index,
			matchScore: score,
			explanation: roleMatch ? 'Role aligns' : 'Partial skill overlap',
			matchedSkills,
		};
	});

	return fallback;
};

const parseResumeProfile = (raw: string): { skills: string[]; targetRole: string; experience: number } | null => {
	const parsed = parseJSONFromAI(raw);
	if (!parsed) return null;

	const skills = Array.isArray(parsed.skills)
		? parsed.skills.map((s) => String(s).trim()).filter(Boolean)
		: [];

	const targetRole = String(parsed.targetRole || '').trim();
	const experience = Math.max(0, Math.round(Number(parsed.experience) || 0));

	return { skills, targetRole, experience };
};

// @desc    Get latest analyzed resume profile for job prefill
// @route   GET /api/jobs/resume-profile
// @access  Protected
export const getLatestResumeProfile = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const latestResume = await Resume.findOne({ user: req.user!._id }).sort({ createdAt: -1 });

		if (!latestResume) {
			res.status(404).json({ success: false, message: 'No analyzed resume found yet.' });
			return;
		}

		const savedSkills = latestResume.aiAnalysis?.skills || [];
		const fallbackProfile = deriveResumeJobProfile(latestResume.rawText);
		let targetRole = fallbackProfile.targetRole;
		let experience = fallbackProfile.experience;

		try {
			const aiExtractRaw = await extractResumeJobProfile(latestResume.rawText);
			const aiExtract = parseResumeProfile(aiExtractRaw);
			if (aiExtract) {
				if (!savedSkills.length && aiExtract.skills.length) {
					savedSkills.push(...aiExtract.skills);
				}

				if (!targetRole || targetRole === 'General Professional') {
					targetRole = aiExtract.targetRole || targetRole;
				}
			}
		} catch (err) {
			// If profile extraction fails, return the deterministic fallback profile.
		}

		if (!savedSkills.length && fallbackProfile.skills.length) {
			savedSkills.push(...fallbackProfile.skills);
		}

		res.json({
			success: true,
			profile: {
				skills: [...new Set(savedSkills.map((s) => s.trim()).filter(Boolean))],
				targetRole,
				experience,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: 'Failed to load resume profile.' });
	}
};

// @desc    Match jobs against skills/role/experience
// @route   POST /api/jobs/match
// @access  Protected
export const matchJobs = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		const { skills, targetRole, experience } = req.body as {
			skills: unknown;
			targetRole: unknown;
			experience: unknown;
		};

		const parsedSkills = parseSkillsInput(skills);
		const parsedTargetRole = String(targetRole || '').trim();
		const parsedExperience = Number(experience);

		if (!parsedSkills.length || !parsedTargetRole || Number.isNaN(parsedExperience) || parsedExperience < 0) {
			res.status(400).json({
				success: false,
				message: 'skills, targetRole, and a valid non-negative experience are required.',
			});
			return;
		}

		await ensureJobSeeded();
		const allJobs = await JobListing.find().lean();

		const candidateJobs = allJobs.filter((job) => {
			const skillMatch = hasSkillOverlap(job.skills || [], parsedSkills);
			const roleMatch = hasRoleOverlap(job.title || '', parsedTargetRole);
			return skillMatch || roleMatch;
		});

		if (!candidateJobs.length) {
			res.json({ success: true, total: 0, jobs: [] });
			return;
		}

		const jobsForScoring: JobForScoring[] = candidateJobs.map((job, index) => ({
			index,
			title: job.title,
			company: job.company,
			location: job.location,
			skills: job.skills,
			description: job.description,
			requirements: job.requirements,
			salary: job.salary,
		}));

		// Fast deterministic scorer used as a low-latency fallback when AI is slow
		const deterministicScoreJobs = (
			jobs: JobForScoring[],
		tuserSkills: string[],
			targetRoleLocal: string,
			exp: number
		): AIMatch[] => {
			return jobs.map((job) => {
				const matchedSkills = job.skills.filter((js) =>
					tuserSkills.some((us) => js.toLowerCase().includes(us) || us.includes(js.toLowerCase()))
				);
				const skillRatio = job.skills.length ? matchedSkills.length / job.skills.length : 0;
				const skillScore = Math.round(skillRatio * 70);
				const roleBoost = hasRoleOverlap(job.title || '', targetRoleLocal) ? 25 : 0;
				let score = skillScore + roleBoost;
				score = clampScore(score);
				return {
					index: job.index,
					matchScore: score,
					explanation: `Quick match: ${matchedSkills.length} skills matched`,
					matchedSkills,
				};
			});
		};

		// Try AI scoring but fallback to deterministic scoring if AI takes too long
		const aiPromise = scoreJobsWithAI(
			jobsForScoring,
			parsedSkills,
			parsedTargetRole,
			Math.max(0, Math.round(parsedExperience))
		);

		const TIMEOUT_MS = 2000; // return deterministic results if AI doesn't reply within this time
		const aiMatches = (await Promise.race([
			aiPromise,
			new Promise<AIMatch[]>((resolve) =>
				setTimeout(() => resolve(deterministicScoreJobs(jobsForScoring, parsedSkills, parsedTargetRole, Math.max(0, Math.round(parsedExperience)))), TIMEOUT_MS)
			),
		])) as AIMatch[];

		const byIndex = new Map<number, AIMatch>();
		aiMatches.forEach((m) => byIndex.set(m.index, m));

		const jobs = candidateJobs
			.map((job, idx) => {
				const ai = byIndex.get(idx);
				if (!ai) return null;

				return {
					id: String(job._id),
					title: job.title,
					company: job.company,
					location: job.location,
					category: job.category,
					skills: job.skills,
					description: job.description,
					requirements: job.requirements,
					salary: job.salary,
					matchScore: ai.matchScore,
					explanation: ai.explanation,
					matchedSkills: ai.matchedSkills || [],
				};
			})
			.filter((job): job is NonNullable<typeof job> => Boolean(job))
			.sort((a, b) => b.matchScore - a.matchScore);

		res.json({ success: true, total: jobs.length, jobs });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Job matching failed.';
		res.status(500).json({ success: false, message });
	}
};
