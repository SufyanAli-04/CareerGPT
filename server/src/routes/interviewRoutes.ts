import { Router } from 'express';
import { generateQuestions, evaluateAnswer, getInterviews, getInterviewById, deleteInterview, endInterview } from '../controllers/interviewController';
import protect from '../middleware/authMiddleware';

const router = Router();

router.use(protect); // All interview routes are protected

router.post('/generate', generateQuestions);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.post('/:id/evaluate', evaluateAnswer);
router.post('/:id/end', endInterview);
router.delete('/:id', deleteInterview);

export default router;
