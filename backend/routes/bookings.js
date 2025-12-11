import express from 'express';
import { createBooking, listBookings } from '../controllers/bookingController.js';
import { getPriceQuote } from '../controllers/pricingController.js';

const router = express.Router();

router.get('/', listBookings);
router.post('/', createBooking);
router.post('/quote', getPriceQuote);

export default router;
