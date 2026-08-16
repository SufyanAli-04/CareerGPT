import { Router } from 'express';
import { uploadResume, getResumes, getResumeById, matchJob, deleteResume, updateResumeSkills } from '../controllers/resumeController';
import protect from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect); // All resume routes are protected

router.post('/upload', upload.single('resume'), uploadResume);
router.post('/analyze', upload.single('resume'), uploadResume); // alias used by frontend
router.get('/', getResumes);
router.put('/skills', updateResumeSkills);
router.get('/:id', getResumeById);
router.post('/:id/match', matchJob);
router.delete('/:id', deleteResume);

export default router;
