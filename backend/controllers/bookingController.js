import { Booking } from '../models/Booking.js';
import { Court } from '../models/Court.js';
import { Coach } from '../models/Coach.js';
import { calculateDynamicPrice } from './pricingController.js';

async function isCourtAvailable(courtId, startTime, endTime) {
  const existing = await Booking.findOne({
    court: courtId,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  });
  return !existing;
}

async function isCoachAvailable(coachId, startTime, endTime) {
  if (!coachId) return true;
  const existing = await Booking.findOne({
    'resources.coach': coachId,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  });
  return !existing;
}

export async function createBooking(req, res, next) {
  try {
    const { userName, courtId, startTime, endTime, rackets = 0, shoes = 0, coachId = null } = req.body;

    if (!userName || !courtId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const court = await Court.findById(courtId);
    if (!court || !court.isActive) return res.status(400).json({ message: 'Invalid or inactive court' });

    const courtFree = await isCourtAvailable(courtId, startTime, endTime);
    if (!courtFree) return res.status(409).json({ message: 'Court is already booked for this time slot' });

    if (coachId) {
      const coach = await Coach.findById(coachId);
      if (!coach || !coach.isActive) return res.status(400).json({ message: 'Invalid or inactive coach' });
    }

    const coachFree = await isCoachAvailable(coachId, startTime, endTime);
    if (!coachFree) return res.status(409).json({ message: 'Coach is not available for this time slot' });

    const pricingBreakdown = await calculateDynamicPrice({ courtId, startTime, endTime, rackets, shoes, coachId });

    const booking = await Booking.create({
      userName,
      court: courtId,
      startTime,
      endTime,
      resources: { rackets, shoes, coach: coachId },
      status: 'confirmed',
      pricingBreakdown
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

export async function listBookings(req, res, next) {
  try {
    const bookings = await Booking.find().populate('court').populate('resources.coach').sort({ startTime: 1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}
