import { Router } from 'express';
import { createNote, getNotes, getNoteById, updateNote, enhanceNote, deleteNote, analyzeNote } from '../controllers/notesController';
import protect from '../middleware/authMiddleware';

const router = Router();

router.use(protect); // All notes routes are protected

router.post('/', createNote);
router.get('/', getNotes);
router.post('/analyze', analyzeNote); // Add analyze route
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.post('/:id/enhance', enhanceNote);
router.delete('/:id', deleteNote);

export default router;
