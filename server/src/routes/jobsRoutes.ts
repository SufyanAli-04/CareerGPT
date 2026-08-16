import { Router } from 'express';
import protect from '../middleware/authMiddleware';
import { getLatestResumeProfile, matchJobs } from '../controllers/jobsController';

const router = Router();

router.use(protect);
router.get('/resume-profile', getLatestResumeProfile);
router.post('/match', matchJobs);

export default router;
