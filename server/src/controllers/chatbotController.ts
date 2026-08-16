import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { chatWithCareerMentor, callOpenRouter } from '../services/aiService';
import Chat from '../models/Chat';
import Resume from '../models/Resume';
import Job from '../models/Job';

// ─── Helper: Fetch user context (resume skills + job matches) ──────────────────
const getUserContext = async (userId: string) => {
  const [resume, jobs] = await Promise.all([
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }).select('aiAnalysis.skills jobMatches'),
    Job.find({ user: userId }).sort({ matchScore: -1 }).limit(5).select('title matchScore'),
  ]);

  return {
    skills: resume?.aiAnalysis?.skills ?? [],
    jobMatches: jobs.map((j) => ({ title: j.title, matchScore: j.matchScore ?? 0 })),
  };
};

// ─── POST /api/chatbot/message ─────────────────────────────────────────────────
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, chatId } = req.body as { message: string; chatId?: string };
    const userId = req.user!._id.toString();

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    // Fetch user's resume + job context
    const context = await getUserContext(userId);

    // Load or create chat session
    let chat = chatId
      ? await Chat.findOne({ _id: chatId, user: userId })
      : null;

    if (!chat) {
      chat = await Chat.create({
        user: userId,
        title: message.slice(0, 60),
        messages: [],
      });
    }

    // Build conversation history for AI (last 20 messages only)
    const history = chat.messages.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Call AI
    const aiResponse = await chatWithCareerMentor(message, history, context);

    // Save both turns to DB
    chat.messages.push({ role: 'user', content: message, timestamp: new Date() });
    chat.messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });
    await chat.save();

    res.json({
      success: true,
      chatId: chat._id,
      message: aiResponse,
      context,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ success: false, message: 'AI Career Mentor failed to respond. Please try again.' });
  }
};

// ─── GET /api/chatbot/sessions ─────────────────────────────────────────────────
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id.toString();
  const sessions = await Chat.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(20)
    .select('title createdAt updatedAt messages isSaved');
  res.json({ success: true, sessions });
};

// ─── GET /api/chatbot/session/:id ─────────────────────────────────────────────
export const getSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id.toString();
  const chat = await Chat.findOne({ _id: req.params.id, user: userId });
  if (!chat) {
    res.status(404).json({ success: false, message: 'Session not found' });
    return;
  }
  res.json({ success: true, chat });
};

// ─── PATCH /api/chatbot/session/:id/save ───────────────────────────────────────
export const toggleSaveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const chat = await Chat.findOne({ _id: req.params.id, user: userId });
    if (!chat) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }
    chat.isSaved = !chat.isSaved;
    await chat.save();
    res.json({ success: true, message: chat.isSaved ? 'Chat saved to library' : 'Chat removed from library', isSaved: chat.isSaved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/chatbot/session/:id ──────────────────────────────────────────
export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id.toString();
  await Chat.findOneAndDelete({ _id: req.params.id, user: userId });
  res.json({ success: true, message: 'Session deleted' });
};

// ─── DELETE /api/chatbot/sessions ─────────────────────────────────────────────
export const clearAllSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id.toString();
  await Chat.deleteMany({ user: userId });
  res.json({ success: true, message: 'All sessions cleared' });
};

// Legacy endpoints kept for backward compat
export const getHistory = getSessions;
export const clearHistory = clearAllSessions;

// ─── POST /api/chatbot/enhance-prompt ──────────────────────────────────────────
export const enhancePrompt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body as { prompt: string };
    if (!prompt || !prompt.trim()) {
      res.status(400).json({ success: false, message: 'Prompt is required' });
      return;
    }

    const systemPrompt = `You are a career prompt enhancer. Your task is to rewrite the user's prompt to be more detailed, professional, and descriptive for a career assistant chatbot. Keep it in first-person perspective. ONLY return the enhanced prompt text, without any quotes, markdown formatting, or introductory/explanatory text.`;
    const enhanced = await callOpenRouter(systemPrompt, prompt, 'openrouter/free');

    res.json({
      success: true,
      enhanced: enhanced.trim(),
    });
  } catch (error) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({ success: false, message: 'Failed to enhance prompt' });
  }
};
