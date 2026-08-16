import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Interview from '../models/Interview';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../services/aiService';

// @desc    Generate interview questions
// @route   POST /api/interview/generate
// @access  Protected
export const generateQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, type, difficulty } = req.body;

    if (!role || !type || !difficulty) {
      res.status(400).json({ message: 'role, type, and difficulty are required' });
      return;
    }

    const rawQuestions = await generateInterviewQuestions(role, type, difficulty);
    let parsedQuestions;
    try {
      const cleaned = rawQuestions.replace(/```json|```/g, '').trim();
      parsedQuestions = JSON.parse(cleaned);
    } catch {
      parsedQuestions = { raw: rawQuestions };
    }

    // Save new interview session
    const interview = await Interview.create({
      user: req.user!._id,
      role,
      type,
      difficulty,
      questions: Array.isArray(parsedQuestions)
        ? parsedQuestions.map((q: any) => ({
            question: q.question,
            sampleAnswer: q.sampleAnswer || q.sample_answer,
          }))
        : [],
    });

    res.status(201).json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate questions', error });
  }
};

// @desc    Submit answer for evaluation
// @route   POST /api/interview/:id/evaluate
// @access  Protected
export const evaluateAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionIndex, userAnswer } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user!._id });

    if (!interview) {
      res.status(404).json({ message: 'Interview session not found' });
      return;
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    const rawEval = await evaluateInterviewAnswer(question.question, userAnswer, interview.role);
    let evaluation;
    try {
      const cleaned = rawEval.replace(/```json|```/g, '').trim();
      evaluation = JSON.parse(cleaned);
    } catch {
      evaluation = { raw: rawEval };
    }

    // Update question with user answer and feedback
    interview.questions[questionIndex].userAnswer = userAnswer;
    interview.questions[questionIndex].score = evaluation.score || 0;
    interview.questions[questionIndex].strengths = evaluation.strengths || [];
    interview.questions[questionIndex].weaknesses = evaluation.weaknesses || [];
    interview.questions[questionIndex].suggestions = evaluation.suggestions || [];
    await interview.save();

    res.json({ success: true, evaluation, interview });
  } catch (error) {
    res.status(500).json({ message: 'Failed to evaluate answer', error });
  }
};

// @desc    End interview and calculate overall score
// @route   POST /api/interview/:id/end
// @access  Protected
export const endInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user!._id });

    if (!interview) {
      res.status(404).json({ message: 'Interview session not found' });
      return;
    }

    const answeredQuestions = interview.questions.filter((q) => q.score !== undefined);
    const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    const overallScore = answeredQuestions.length > 0 ? Math.round(totalScore / answeredQuestions.length) : 0;

    interview.overallScore = overallScore;
    interview.completedAt = new Date();
    await interview.save();

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ message: 'Failed to end interview', error });
  }
};

// @desc    Get all interview sessions for user
// @route   GET /api/interview
// @access  Protected
export const getInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviews = await Interview.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single interview session
// @route   GET /api/interview/:id
// @access  Protected
export const getInterviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user!._id });
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete interview session
// @route   DELETE /api/interview/:id
// @access  Protected
export const deleteInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Interview.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    res.json({ success: true, message: 'Interview deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
