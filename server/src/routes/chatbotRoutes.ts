import { Router } from 'express';
import {
  sendMessage,
  getSessions,
  getSession,
  deleteSession,
  clearAllSessions,
  toggleSaveSession,
  enhancePrompt,
} from '../controllers/chatbotController';
import protect from '../middleware/authMiddleware';

const router = Router();
router.use(protect);

router.post('/message', sendMessage);
router.post('/enhance-prompt', enhancePrompt);
router.get('/sessions', getSessions);
router.get('/session/:id', getSession);
router.patch('/session/:id/save', toggleSaveSession);
router.delete('/session/:id', deleteSession);
router.delete('/sessions', clearAllSessions);

// Legacy aliases
router.get('/history', getSessions);
router.delete('/history', clearAllSessions);

export default router;
