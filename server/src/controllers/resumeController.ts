import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/authMiddleware';
import Resume from '../models/Resume';
import { analyzeResume, matchJobsToResume, validateResumeAI, parseResumeStructure } from '../services/aiService';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth') as { extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }> };

// @desc    Upload and analyze resume
// @route   POST /api/resume/upload
// @access  Protected
export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Extract text from PDF or DOCX
    let rawText = '';
    const mime = req.file.mimetype;

    if (mime === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      rawText = pdfData.text;
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = result.value;
    } else {
      rawText = req.file.buffer.toString('utf-8');
    }

    if (!rawText.trim()) {
      res.status(400).json({ message: 'Enter a valid resume' });
      return;
    }

    // Compute text SHA-256 hash for user-scoped cache checking
    const textHash = crypto.createHash('sha256').update(rawText).digest('hex');

    // Retrieve user target keywords input
    let extraSkills: string[] = [];
    if (req.body.extraSkills) {
      try {
        extraSkills = JSON.parse(req.body.extraSkills);
        if (!Array.isArray(extraSkills)) {
          extraSkills = [];
        }
      } catch (e) { }
    }

    // Check user-scoped cache database hit
    const cachedResume = await Resume.findOne({ user: req.user!._id, textHash }).sort({ createdAt: -1 });
    if (cachedResume && cachedResume.aiAnalysis) {
      // Just return the cached document directly! Do NOT create a duplicate in the DB.
      res.status(200).json({ success: true, resume: cachedResume, cached: true });
      return;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // STRICT RESUME VALIDATION PIPELINE
    // Only genuine resumes/CVs pass. Everything else is rejected before ATS analysis.
    // ═══════════════════════════════════════════════════════════════════════════════
    const textLower = rawText.toLowerCase();

    // ── GATE 0: Instant Non-Resume Keyword Detection ─────────────────────────
    // Catch marksheets, transcripts, fee challans, reports IMMEDIATELY before AI calls.
    const HARD_REJECT_KEYWORDS: string[] = [
      'marksheet', 'mark sheet', 'marks obtained', 'obtained marks', 'total marks',
      'roll number', 'roll no', 'roll no.',
      'result card', 'result sheet', 'examination result',
      'grade card', 'grade report',
      'transcript', 'academic transcript',
      'cgpa report', 'gpa report',
      'board of intermediate', 'board of education', 'board of secondary',
      'university result',
      'fee voucher', 'fee challan', 'fee receipt',
      'semester result', 'semester marks', 'semester grade',
      'table of contents',
      'chapter 1', 'chapter 2', 'chapter 3',
      'software requirements specification', 'srs document',
      'system interfaces', 'hardware interfaces', 'software interfaces',
      'slide deck', 'powerpoint presentation',
      'assignment submission', 'lab report', 'lab manual',
      'invoice number', 'payment receipt',
    ];

    const hardRejectHits: string[] = [];
    for (const kw of HARD_REJECT_KEYWORDS) {
      if (textLower.includes(kw)) hardRejectHits.push(kw);
    }

    if (hardRejectHits.length >= 3) {
      res.status(400).json({
        message: `Rejected: Detected non-resume content ("${hardRejectHits.slice(0, 3).join('", "')}")`,
      });
      return;
    }

    // ── GATE 1: Quick Regex Contact Check ────────────────────────────────────
    // Fast-reject documents with no email AND no phone at all (e.g., pure text reports).
    const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
    const PHONE_REGEX = /(\+?\d[\d\s\-().]{7,}\d)/;
    const quickEmail = EMAIL_REGEX.test(rawText);
    const quickPhone = PHONE_REGEX.test(rawText);

    if (!quickEmail && !quickPhone) {
      res.status(400).json({
        message: `Rejected: Missing email and phone number`,
      });
      return;
    }

    // ── GATE 2: AI Resume Structure Parsing ──────────────────────────────────
    // Use AI to extract the resume as structured JSON. Non-resumes will return null/empty.
    console.log('[Validation] Running AI structure parser...');
    let parsed;
    try {
      parsed = await parseResumeStructure(rawText);
    } catch (err: any) {
      console.error('[Validation] AI parser failed:', err);
      res.status(400).json({
        message: `Analysis failed: ${err.message || 'AI service is temporarily unavailable. Please try again.'}`,
      });
      return;
    }

    console.log('[Validation] Parsed structure:', JSON.stringify({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      skillsCount: parsed.skills.length,
      educationCount: parsed.education.length,
    }));

    // ── GATE 3: Mandatory Fields Validation ──────────────────────────────────
    const missingFields: string[] = [];

    if (!parsed.name || parsed.name.trim().length < 2) {
      missingFields.push('Full Name');
    }

    const parsedEmail = parsed.email?.match(EMAIL_REGEX)?.[0] || null;
    const parsedPhone = parsed.phone?.match(PHONE_REGEX)?.[0] || null;

    if (!parsedEmail) missingFields.push('Valid Email Address');
    if (parsed.education.length === 0) missingFields.push('Education Section');

    if (missingFields.length > 0) {
      res.status(400).json({
        message: `Rejected: Missing mandatory fields: ${missingFields.join(', ')}`,
      });
      return;
    }

    // ── GATE 4: Layout Score ──────────────────────────────────────────────────
    let layoutScore = 0;
    if (parsedEmail) layoutScore += 20;
    if (parsedPhone) layoutScore += 20;
    if (parsed.education.length > 0) layoutScore += 15;
    if (parsed.skills && parsed.skills.length > 0) layoutScore += 15;
    if (parsed.experience.length > 0) layoutScore += 15;
    if (parsed.projects.length > 0) layoutScore += 15;

    if (layoutScore < 55) {
      res.status(400).json({
        message: `Rejected: Layout score too low (${layoutScore}/100)`,
      });
      return;
    }

    // ── GATE 5: AI Binary Classification ─────────────────────────────────────
    console.log('[Validation] Running AI binary classifier...');
    let classification;
    try {
      classification = await validateResumeAI(rawText);
    } catch (err: any) {
      console.error('[Validation] AI binary classification failed:', err);
      res.status(400).json({
        message: `Analysis failed: ${err.message || 'AI service is temporarily unavailable. Please try again.'}`,
      });
      return;
    }

    console.log('[Validation] AI classification:', classification);
    if (!classification.isResume) {
      res.status(400).json({
        message: `Rejected: Not recognized as a professional Resume/CV`,
      });
      return;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALL VALIDATION GATES PASSED — proceed to ATS analysis

    let atsParsed: Record<string, unknown> | null = null;
    let aiRaw = '';

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        aiRaw = await analyzeResume(rawText);
        // Strip markdown code blocks if present
        const cleaned = aiRaw.replace(/```json|```/gi, '').trim();
        // Find the first { and last } to extract JSON
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error('No JSON object found in response');

        atsParsed = JSON.parse(cleaned.slice(start, end + 1));

        // Break the loop if successful
        break;
      } catch (parseErr: any) {
        console.error(`Attempt ${attempt} failed to parse AI JSON. Retrying...`);
        if (attempt === 3) {
          console.error('JSON Parse Error. Raw string was:\n', aiRaw, '\nError:', parseErr);
          res.status(500).json({ message: 'AI returned invalid JSON after 3 attempts. Please try again.' });
          return;
        }
      }
    }

    if (!atsParsed) {
      res.status(500).json({ message: 'AI returned invalid JSON after 3 attempts. Please try again.' });
      return;
    }

    // Merge validated skills from structure parser + extra user-supplied skills + ATS skills
    const atsSkills = Array.isArray(atsParsed.skills) ? atsParsed.skills as string[] : [];
    const mergedSkills = [...new Set([
      ...parsed.skills.map(s => s.trim()).filter(Boolean),
      ...atsSkills.map(s => s.trim()).filter(Boolean),
      ...extraSkills.map(s => s.trim()).filter(Boolean),
    ])];

    const aiAnalysis = {
      overallScore: Number(atsParsed.score) || 0,
      keywordMatch: Number(atsParsed.keywordMatch) || 0,
      formatting: Number(atsParsed.formatting) || 0,
      contentQuality: Number(atsParsed.contentQuality) || 0,
      skills: mergedSkills,
      strengths: Array.isArray(atsParsed.strengths) ? atsParsed.strengths as string[] : [],
      weaknesses: Array.isArray(atsParsed.weaknesses) ? atsParsed.weaknesses as string[] : [],
      suggestions: Array.isArray(atsParsed.suggestions)
        ? (atsParsed.suggestions as { priority: string; title: string; detail: string }[])
        : [],
      atsScore: Number(atsParsed.score) || 0,
    };

    // Save to DB
    const resume = await Resume.create({
      user: req.user!._id,
      fileName: req.file.originalname,
      rawText,
      textHash,
      aiAnalysis,
    });

    res.status(201).json({ success: true, resume });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Resume analysis failed', error: String(error) });
  }
};



// @desc    Get all resumes for user
// @route   GET /api/resume
// @access  Protected
export const getResumes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resumes = await Resume.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resume/:id
// @access  Protected
export const getResumeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user!._id });
    if (!resume) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Match resume against job description
// @route   POST /api/resume/:id/match
// @access  Protected
export const matchJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobTitle, company, jobDescription } = req.body;
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user!._id });

    if (!resume) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }

    const matchRaw = await matchJobsToResume(resume.rawText, jobDescription);
    let matchResult;
    try {
      const cleaned = matchRaw.replace(/```json|```/g, '').trim();
      matchResult = JSON.parse(cleaned);
    } catch {
      matchResult = { raw: matchRaw };
    }

    // Save match to resume
    resume.jobMatches = resume.jobMatches || [];
    resume.jobMatches.push({
      jobTitle,
      company,
      description: jobDescription,
      matchScore: matchResult.matchScore || 0,
      matchingSkills: matchResult.matchingSkills || [],
      missingSkills: matchResult.missingSkills || [],
    });
    await resume.save();

    res.json({ success: true, matchResult });
  } catch (error) {
    res.status(500).json({ message: 'Job matching failed', error });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
// @access  Protected
export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    if (!resume) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update resume skills
// @route   PUT /api/resume/skills
// @access  Protected
export const updateResumeSkills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      res.status(400).json({ message: 'Skills must be an array of strings' });
      return;
    }

    const resume = await Resume.findOne({ user: req.user!._id }).sort({ createdAt: -1 });
    if (!resume) {
      res.status(404).json({ message: 'No analyzed resume found to update.' });
      return;
    }

    if (!resume.aiAnalysis) {
      resume.aiAnalysis = {
        overallScore: 0,
        keywordMatch: 0,
        formatting: 0,
        contentQuality: 0,
        skills: [],
        strengths: [],
        weaknesses: [],
        suggestions: [],
        atsScore: 0,
      };
    }

    resume.aiAnalysis.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    await resume.save();

    res.json({ success: true, resume });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update resume skills', error: error.message });
  }
};
