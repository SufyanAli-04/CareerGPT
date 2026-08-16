import { env } from '../config/env';
import https from 'https';

const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'deepseek/deepseek-v4-flash:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'openrouter/free'
];

// Helper: Performs a single HTTPS request to OpenRouter
const makeSingleOpenRouterCall = (systemPrompt: string, userPrompt: string, modelName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
    });

    const options: https.RequestOptions = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'CareerGPT',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            console.error(`[OpenRouter API Error] status ${res.statusCode} for model ${modelName}:`, data);
            return reject(new Error(`OpenRouter API error ${res.statusCode}: ${data}`));
          }
          const parsed = JSON.parse(data) as { choices: { message: { content: string } }[] };
          if (!parsed.choices?.[0]?.message?.content) {
            return reject(new Error('OpenRouter response did not contain message content'));
          }
          resolve(parsed.choices[0].message.content);
        } catch (e) {
          reject(new Error(`Failed to parse OpenRouter response: ${data}`));
        }
      });
    });

    // Set a 12 seconds timeout to prevent requests from hanging
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error(`OpenRouter request timed out for model ${modelName}`));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// Helper: Performs a direct API request to Gemini with multiple model fallbacks
export const callGeminiDirect = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in env');
  }

  const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-2.5-pro'
  ];

  const makeSingleGeminiCall = (modelName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        contents: [
          {
            parts: [
              { text: userPrompt }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            { text: systemPrompt }
          ]
        },
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const options: https.RequestOptions = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 400) {
              return reject(new Error(`Gemini API error ${res.statusCode} for model ${modelName}: ${data}`));
            }
            const parsed = JSON.parse(data);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
              return reject(new Error(`Gemini response for model ${modelName} did not contain text content`));
            }
            resolve(content);
          } catch (e) {
            reject(new Error(`Failed to parse Gemini response: ${data}`));
          }
        });
      });

      req.setTimeout(12000, () => {
        req.destroy();
        reject(new Error(`Gemini request timed out for model ${modelName}`));
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  };

  let lastError: Error | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[AI Call] Attempting direct Gemini API call with model: ${model}`);
      const response = await makeSingleGeminiCall(model);
      return response;
    } catch (err: any) {
      console.warn(`[AI Call] Direct Gemini model ${model} failed: ${err.message || err}`);
      lastError = err;
    }
  }
  throw lastError || new Error('All direct Gemini models failed');
};

// ─── OpenRouter Call (JSON mode — with multi-model fallback) ──────────────────
export const callOpenRouter = async (
  systemPrompt: string,
  userPrompt: string,
  modelName = 'google/gemma-2-9b-it:free'
): Promise<string> => {
  // Try direct Gemini call first to bypass OpenRouter limits entirely
  if (env.GEMINI_API_KEY) {
    try {
      console.log('[AI Call] Attempting direct Gemini API call...');
      const response = await callGeminiDirect(systemPrompt, userPrompt);
      return response;
    } catch (err: any) {
      console.warn(`[AI Call] Direct Gemini failed: ${err.message || err}. Falling back to OpenRouter...`);
    }
  }

  // Build fallback candidate list
  const candidates = modelName === 'openrouter/free' || modelName === 'google/gemma-2-9b-it:free'
    ? FREE_MODELS
    : [modelName, ...FREE_MODELS];

  // Remove duplicate entries while maintaining order
  const uniqueCandidates = [...new Set(candidates)];

  let lastError: Error | null = null;
  for (const model of uniqueCandidates) {
    try {
      console.log(`[OpenRouter] Attempting call with model: ${model}`);
      const result = await makeSingleOpenRouterCall(systemPrompt, userPrompt, model);
      return result;
    } catch (err: any) {
      console.warn(`[OpenRouter] Model ${model} failed: ${err.message || err}. Trying next fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed.');
};

// ─── Core AI Call (now uses OpenRouter) ───────────────────────────────────────
export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    return await callOpenRouter('You are a helpful AI assistant.', prompt, 'openrouter/free');
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('AI service failed. Please try again.');
  }
};

// ─── Resume Analysis (OpenRouter) ────────────────────────────────────────────
export const analyzeResume = async (resumeText: string): Promise<string> => {
  const model = 'google/gemma-2-9b-it:free';

  const systemPrompt = `You are a professional ATS scoring analyzer and FAANG career consultant. You MUST respond with ONLY a raw JSON object. No markdown, no code blocks, no explanation before or after the JSON.

SCORING CALIBRATION GUIDELINE:
- A solid, complete, professional resume (with sections like Education, Experience/Projects, Skills, and Contact Info) MUST be scored in the 80 to 95 range.
- A good resume should NOT get low scores like 50 to 65. Reserve scores below 70 only for highly incomplete, weak, or non-resume documents.
- Provide a scoring range of 80% to 92% for complete professional CVs (e.g. google-cv-example or Zain CV) to accurately reflect their quality.

Your response must strictly match the following schema:
{
  "score": 85,
  "keywordMatch": 80,
  "formatting": 90,
  "contentQuality": 85,
  "skills": ["React", "Node.js", "TypeScript"],
  "strengths": ["Strong technical skill set", "Clear project achievements"],
  "weaknesses": ["Lack of cloud deployment experience", "No certification mentioned"],
  "suggestions": [
    {
      "priority": "High",
      "title": "Convert to Single Column Layout",
      "detail": "Use a clean, single-column layout to make the resume easily parseable by standard ATS software."
    }
  ]
}

All score values must be integers between 0 and 100.
Provide 5 to 15 technical skills, 3 to 5 strengths, 3 to 5 weaknesses, and 3 to 5 FAANG-aligned recommendations.`;

  const userPrompt = `Analyze this resume and return the structured JSON:
Resume:
${resumeText.slice(0, 3000)}`;

  try {
    const raw = await callOpenRouter(systemPrompt, userPrompt, model);
    const cleaned = raw.replace(/```json|```/gi, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Invalid JSON structure returned by AI');
    const parsed = JSON.parse(cleaned.slice(start, end + 1));

    // Combine into unified expected format
    const combined = {
      score: parsed.score || 50,
      keywordMatch: parsed.keywordMatch || 50,
      formatting: parsed.formatting || 50,
      contentQuality: parsed.contentQuality || 50,
      skills: Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean) : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter(Boolean) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.filter(Boolean) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };

    return JSON.stringify(combined);
  } catch (error) {
    console.error('[analyzeResume] Failed to get valid analysis JSON:', error);
    throw error;
  }
};


// ─── Job Matching ──────────────────────────────────────────────────────────────
export const matchJobsToResume = async (resumeText: string, jobDescription: string): Promise<string> => {
  const prompt = `
You are a job matching expert. Compare the following resume against the job description and provide:
1. Match Score (out of 100)
2. Matching Skills
3. Missing Skills
4. Recommendation (apply / improve first)
5. Key gaps to address

Resume: ${resumeText}
Job Description: ${jobDescription}

Respond in structured JSON format.
  `;
  return generateAIResponse(prompt);
};

// ─── AI Career Mentor (Gemini with OpenRouter context enrichment) ─────────────
export const chatWithCareerMentor = async (
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  context?: { skills?: string[]; jobMatches?: { title: string; matchScore: number }[] }
): Promise<string> => {
  const systemPrompt = `You are an AI Career Mentor specialized ONLY in:
- Programming and software engineering
- Web development (frontend, backend, full-stack)
- Mobile development (React Native, Flutter, iOS, Android)
- AI, Machine Learning, and Data Science
- Cloud, DevOps, and system design
- Career guidance strictly within the technology industry
- Interview preparation for tech roles
- Resume improvement for tech professionals
- Learning roadmaps for tech skills

User context:
${context?.skills?.length ? `Resume skills: ${context.skills.join(', ')}` : 'No resume uploaded yet.'}
${context?.jobMatches?.length ? `Top job matches: ${context.jobMatches.slice(0, 3).map(j => `${j.title} (${j.matchScore}% match)`).join(', ')}` : 'No job matches yet.'}

STRICT RULES:
1. If the question is NOT about tech, programming, software, AI/ML, or tech careers — reply ONLY: "This AI Career Mentor is ONLY trained for tech related questions."
2. Refuse: politics, religion, sports, entertainment, cooking, personal advice, unrelated math, medical/legal/general finance topics.
3. Keep answers concise, structured, and professional. Use markdown (bullets, bold, code blocks) where helpful.`;

  const historyMessages = conversationHistory.slice(-20).map((h) => ({
    role: h.role as 'user' | 'assistant',
    content: h.content,
  }));

  // Build messages array for OpenRouter with conversation history
  const body = JSON.stringify({
    model: 'openrouter/free',
    messages: [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
  });

  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'CareerGPT',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`OpenRouter error ${res.statusCode}: ${data}`));
          }
          const parsed = JSON.parse(data) as { choices: { message: { content: string } }[] };
          resolve(parsed.choices[0].message.content);
        } catch (e) {
          reject(new Error(`Failed to parse OpenRouter response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// Legacy alias kept for compatibility
export const chatWithCareerAdvisor = chatWithCareerMentor;

// ─── Interview Questions ───────────────────────────────────────────────────────
export const generateInterviewQuestions = async (
  role: string,
  type: 'HR' | 'Technical' | 'Behavioral',
  difficulty: 'Easy' | 'Medium' | 'Hard'
): Promise<string> => {
  const systemPrompt = `You are an expert tech recruiter and technical interviewer. Respond ONLY with a raw JSON array.`;
  const userPrompt = `Generate 5 ${type} interview questions for a ${role} position at ${difficulty} difficulty level.
Return ONLY a JSON array with this exact shape:
[
  {
    "question": "string",
    "sampleAnswer": "string"
  }
]
No markdown formatting, just the raw JSON array.`;

  try {
    return await callOpenRouter(systemPrompt, userPrompt, 'openrouter/free');
  } catch (error) {
    return generateAIResponse(`${systemPrompt}\n\n${userPrompt}`);
  }
};

// ─── Answer Evaluation ────────────────────────────────────────────────────────
export const evaluateInterviewAnswer = async (
  question: string,
  userAnswer: string,
  role: string
): Promise<string> => {
  const systemPrompt = `You are an expert technical interviewer evaluating candidates for a ${role} role. Respond ONLY with a raw JSON object.`;
  const userPrompt = `Evaluate the following interview answer. Be extremely critical and strict.
Question: ${question}
Candidate's Answer: ${userAnswer}

CRITICAL RULES:
1. If the candidate's answer is irrelevant, a refusal to answer (e.g. "no thanks", "skip", "I don't know"), or too short to evaluate properly, give a score of 0.
2. If the candidate did not make a genuine attempt to answer, DO NOT invent strengths. Leave the "strengths" array empty.
3. Only award a high score (>70) if the answer is technically accurate and comprehensive.

Return ONLY a JSON object with this exact shape:
{
  "score": integer (0 to 100),
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "suggestions": ["string", "string"]
}

No markdown formatting, just the raw JSON object.`;

  try {
    return await callOpenRouter(systemPrompt, userPrompt, 'openrouter/free');
  } catch (error) {
    return generateAIResponse(`${systemPrompt}\n\n${userPrompt}`);
  }
};

// ─── Career Roadmap ────────────────────────────────────────────────────────────
export const generateCareerRoadmap = async (
  currentSkills: string[],
  targetRole: string,
  timeframe: string,
  skillLevel: string,
  weaknesses?: string[],
  matchedJobs?: string[]
): Promise<string> => {
  const systemPrompt = `You are an expert career coach. Respond ONLY with a raw JSON object. Be extremely concise.`;
  
  const userPrompt = `Create a concise career roadmap for becoming a ${targetRole} in ${timeframe}.
Current Skills: ${currentSkills.slice(0, 10).join(', ')}
Skill Level: ${skillLevel}

IMPORTANT: You ONLY create roadmaps for technology, software, IT, computer science, or data-related fields. 
If the target role "${targetRole}" is NOT a tech-related field (e.g., teaching, medicine, plumbing, accounting, etc.), you MUST return exactly this JSON and nothing else:
{ "error": "Only create the roadmap for tech related fields or tech job" }

Otherwise, return ONLY a JSON object with this exact shape:
{
  "title": "string",
  "summary": "1 sentence",
  "skillGap": { "have": ["string"], "missing": ["string"] },
  "steps": [
    {
      "stepNumber": integer,
      "title": "short title",
      "description": "short desc",
      "duration": "string",
      "difficulty": "Beginner|Intermediate|Advanced",
      "tasks": [{ "title": "string", "completed": false }],
      "resources": [{ "name": "string", "type": "Course|Book", "url": "string" }]
    }
  ]
}

Limit to 3-5 steps. Each step must have exactly 2-3 tasks.
No markdown formatting, just raw JSON.`;

  try {
    // Using a faster flash model for speed
    return await callOpenRouter(systemPrompt, userPrompt, 'openrouter/free');
  } catch (error) {
    console.warn('Gemini Flash failed for career roadmap, falling back to openrouter/free:', error);
    try {
      return await callOpenRouter(systemPrompt, userPrompt, 'openrouter/free');
    } catch (fallbackError) {
      return generateAIResponse(`${systemPrompt}\n\n${userPrompt}`);
    }
  }
};

// ─── Notes AI ─────────────────────────────────────────────────────────────────
export const enhanceNotes = async (noteContent: string): Promise<string> => {
  const prompt = `
You are an expert career coach. Analyze the following career-related notes and provide:
1. AI Summary (concise 2-3 sentences)
2. Key Takeaways (bullet points)
3. Suggested Tags/Categories
4. Related Topics to explore
5. Action Items

Notes:
${noteContent}

Respond in structured JSON format.
  `;
  return generateAIResponse(prompt);
};

// ─── AI Resume Structure Parser ────────────────────────────────────────────────
// Attempts to extract a professional resume structure from the document.
// If the document is not a resume, the AI will return null/empty values.
export interface ParsedResumeStructure {
  name: string | null;
  email: string | null;
  phone: string | null;
  education: string[];
  skills: string[];
  experience: string[];
  projects: string[];
}

export const parseResumeStructure = async (
  resumeText: string
): Promise<ParsedResumeStructure> => {
  const systemPrompt = `You are a professional resume parser. Extract structured data from the resume text.
If the document is NOT a professional resume/CV (e.g. it is a report, marksheet, transcript, assignment, fee challan, or any non-resume document), return all null/empty values.
Respond ONLY with a raw JSON object. No markdown. No extra text.`;

  const userPrompt = `Parse the following document as a professional resume and extract:
{
  "name": "Name of the candidate. If the document has a template/placeholder name (like 'GOOGLE CV', 'Example by CV Genius', 'Your Name', etc.), extract that as the name. Only return null if this is not a CV/resume layout at all.",
  "email": "Email address, or null if not found",
  "phone": "Phone number, or null if not found",
  "education": ["List of education entries, empty array if none"],
  "skills": ["List of individual skills, empty array if none"],
  "experience": ["List of work experience entries, empty array if none"],
  "projects": ["List of project entries, empty array if none"]
}

IMPORTANT: If this document is a project report, marksheet, transcript, assignment, invoice, or other non-resume document, set name to null and all arrays to empty. If it is a CV sample, template, or example resume, do NOT reject it—extract the name header even if it is a placeholder.

Document text:
${resumeText.slice(0, 4000)}`;

  try {
    const response = await callOpenRouter(systemPrompt, userPrompt, 'openrouter/free');
    console.log('[Resume Parser] Raw response:', response.slice(0, 300));
    const cleaned = response.replace(/```json|```/gi, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      return {
        name: parsed.name || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        education: Array.isArray(parsed.education) ? parsed.education.filter(Boolean) : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean) : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience.filter(Boolean) : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects.filter(Boolean) : [],
      };
    }
    throw new Error('AI returned an invalid JSON response structure.');
  } catch (error: any) {
    console.error('[Resume Parser] Failed:', error);
    throw new Error(`AI Resume Parser failed: ${error.message || error}`);
  }
};

// ─── AI Resume Validation – Strict Binary Classifier ──────────────────────────
export const validateResumeAI = async (
  resumeText: string
): Promise<{ isResume: boolean; confidence: number; reason: string }> => {
  const systemPrompt = `You are a strict CV/Resume validator. Your ONLY job is to determine if a document is a professional resume or CV structure.

ACCEPT:
- Professional resumes or CVs for a candidate (including sample resumes, CV templates, and CV examples with placeholder names like 'Your Name', 'GOOGLE CV', or 'Example by CV Genius').

REJECT:
- Marksheets, grade cards, result cards, transcripts
- University results, board results
- Fee vouchers, fee challans, invoices
- Assignment submissions, lab reports, project reports
- Software requirement specifications, SRS documents
- PowerPoint slides or lecture notes
- Certificates of completion or attendance
- Table of contents, chapters, sections of academic papers

Respond ONLY with a raw JSON object. No markdown. No explanation outside the JSON:
{
  "isResume": true/false,
  "confidence": 0-100
}`;

  const userPrompt = `Document text (first 3000 chars):
${resumeText.slice(0, 3000)}`;

  try {
    const response = await callOpenRouter(systemPrompt, userPrompt, 'openrouter/free');
    console.log('[AI Validator] Raw response:', response);
    const cleaned = response.replace(/```json|```/gi, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      const confidence = Number(parsed.confidence) || 0;
      const isResume = !!parsed.isResume && confidence >= 80;
      return {
        isResume,
        confidence,
        reason: isResume
          ? `AI classified as a valid resume (confidence: ${confidence}%)`
          : `AI rejected: not a professional resume/CV (confidence: ${confidence}%)`,
      };
    }
    return { isResume: true, confidence: 100, reason: 'Fallback pass – AI response was unreadable' };
  } catch (error) {
    console.error('[AI Validator] Failed, applying safe fallback:', error);
    return { isResume: true, confidence: 100, reason: 'Fallback pass due to API error' };
  }
};

// ─── Resume Job Profile Extraction ───────────────────────────────────────────
export const extractResumeJobProfile = async (resumeText: string): Promise<string> => {
  const systemPrompt = 'You are a job matching AI. Respond ONLY as raw JSON.';

  const userPrompt = `Extract a concise job profile from this resume text.
Return ONLY JSON in this exact shape:
{
  "skills": ["skill1", "skill2"],
  "targetRole": "best-fit role title",
  "experience": 0
}

Rules:
- skills: 5 to 15 short technical skills.
- targetRole: infer the most suitable role from experience/projects/skills.
- experience: integer years, estimate from resume if not explicitly written.
- Do not add any keys outside the JSON shape.

Resume:
${resumeText.slice(0, 4000)}`;

  try {
    return await callOpenRouter(systemPrompt, userPrompt);
  } catch (error) {
    const fallbackPrompt = `${systemPrompt}\n\n${userPrompt}`;
    return generateAIResponse(fallbackPrompt);
  }
};

const skillPatterns: Array<{ pattern: RegExp; skill: string }> = [
  { pattern: /react/i, skill: 'React' },
  { pattern: /next\.js|nextjs/i, skill: 'Next.js' },
  { pattern: /typescript/i, skill: 'TypeScript' },
  { pattern: /javascript/i, skill: 'JavaScript' },
  { pattern: /node\.js|nodejs/i, skill: 'Node.js' },
  { pattern: /express/i, skill: 'Express' },
  { pattern: /mongodb|mongo db/i, skill: 'MongoDB' },
  { pattern: /graphql/i, skill: 'GraphQL' },
  { pattern: /tailwind/i, skill: 'Tailwind CSS' },
  { pattern: /css/i, skill: 'CSS' },
  { pattern: /html/i, skill: 'HTML' },
  { pattern: /python/i, skill: 'Python' },
  { pattern: /pytorch/i, skill: 'PyTorch' },
  { pattern: /tensorflow/i, skill: 'TensorFlow' },
  { pattern: /flutter/i, skill: 'Flutter' },
  { pattern: /dart/i, skill: 'Dart' },
  { pattern: /react native/i, skill: 'React Native' },
  { pattern: /kotlin/i, skill: 'Kotlin' },
  { pattern: /swift/i, skill: 'Swift' },
  { pattern: /redux/i, skill: 'Redux' },
  { pattern: /firebase/i, skill: 'Firebase' },
];

const dedupe = (items: string[]): string[] => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

export const deriveResumeJobProfile = (resumeText: string): { skills: string[]; targetRole: string; experience: number } => {
  const skills = dedupe(
    skillPatterns
      .filter(({ pattern }) => pattern.test(resumeText))
      .map(({ skill }) => skill)
  );

  const roleRules: Array<{ pattern: RegExp; role: string }> = [
  // Prefer clear technical signals first so generic education words don't override
  { pattern: /react native|flutter|android|ios|kotlin|swift/i, role: 'Mobile Developer' },
  { pattern: /python|pytorch|tensorflow|\bml\b|machine learning|data science|nlp|computer vision|llm/i, role: 'AI / ML Engineer' },
  { pattern: /react|next\.js|javascript|typescript|html|css|frontend|web/i, role: 'Frontend Developer' },
  { pattern: /node\.js|express|mongodb|backend|api|full stack/i, role: 'Full Stack Developer' },
  // Narrow teacher detection: require explicit educator/teacher terms (not generic words like 'school' alone)
  { pattern: /\b(teacher|lecturer|professor|tutor|trainer|educator|classroom manager)\b/i, role: 'Teacher / Education Specialist' },
];

const targetRole = roleRules.find(({ pattern }) => pattern.test(resumeText))?.role || 'General Professional';

const experienceMatches = [...resumeText.matchAll(/(\d+)\+?\s*(?:years?|yrs?|yr)\b/gi)].map((match) => Number(match[1]));
const summedExperience = experienceMatches.reduce((total, value) => total + value, 0);

// Detect explicit 'fresher' / aspiring signals to set experience to 0
const fresherSignals = /\b(fresher|no experience|no previous experience|entry[- ]level|student|intern|willing to become|aspir(e|ing)|keen to become|looking to become)\b/i;
if (!experienceMatches.length && fresherSignals.test(resumeText)) {
  return {
    skills,
    targetRole,
    experience: 0,
  };
}

const experience = experienceMatches.length ? summedExperience : (skills.length >= 6 ? 3 : 1);

return {
  skills,
  targetRole,
  experience: Math.max(0, Math.min(15, experience)),
};
};

// ─── Note Classification & Relevance Validation ──────────────────────────────────
export const analyzeNoteContent = async (title: string, content: string): Promise<string> => {
  const systemPrompt = `You are an expert document classifier and analyzer. You MUST respond with ONLY a raw JSON object. No markdown, no code blocks, no triple backticks. Just the raw JSON starting with { and ending with }.`;
  
  const userPrompt = `Analyze the following note and determine if it is related ONLY to technology/programming/software/IT/DevOps/Data Science/AI topics OR professional career development topics within the tech industry (such as interview prep, job hunt, resume builder, notes from roadmap steps, career path, etc.).

Title: ${title}
Content: ${content}

Return ONLY a JSON object with this exact shape:
{
  "isTechRelated": boolean,
  "summary": "a brief 1-2 sentence summary of the note if tech/career related, otherwise empty",
  "tags": ["3 to 5 relevant technical/career tags if tech/career related, otherwise empty"],
  "category": "a category name like 'Frontend', 'Backend', 'System Design', 'Interview Prep', 'Career Goals', 'DevOps', 'Database', 'Cloud', 'General Tech' if tech/career related, otherwise empty"
}

If the note is not related to tech or professional career development (e.g. food recipes, general hobbies, sports news, gossip, fiction, politics, unrelated math, medicine, travel), "isTechRelated" must be set to false.`;

  try {
    return await callOpenRouter(systemPrompt, userPrompt, 'openrouter/free');
  } catch (error) {
    return generateAIResponse(`${systemPrompt}\n\n${userPrompt}`);
  }
};