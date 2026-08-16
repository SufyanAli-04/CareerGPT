import { Router } from 'express';
import { createCheckoutSession, verifyCheckoutSession } from '../controllers/stripeController';
import protect from '../middleware/authMiddleware';

const router = Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-session', protect, verifyCheckoutSession);

export default router;
