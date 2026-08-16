import { Router } from 'express';
import { generateRoadmap, getRoadmaps, getRoadmapById, updateStepProgress, updateTaskProgress, deleteRoadmap } from '../controllers/roadmapController';
import protect from '../middleware/authMiddleware';

const router = Router();

router.use(protect); // All roadmap routes are protected

router.post('/generate', generateRoadmap);
router.get('/', getRoadmaps);
router.get('/user', getRoadmaps);
router.get('/:id', getRoadmapById);
router.patch('/:id/step/:stepIndex', updateStepProgress);
router.patch('/:id/step/:stepIndex/task/:taskIndex', updateTaskProgress);
router.delete('/:id', deleteRoadmap);

export default router;
