import { Router } from 'express';
import { createBooking, getBookedDates } from '../controllers/bookingController';

const router = Router();

router.post('/', createBooking);
router.get('/booked-dates', getBookedDates);

export default router;
