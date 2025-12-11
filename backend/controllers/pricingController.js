import { PricingRule } from '../models/PricingRule.js';
import { Court } from '../models/Court.js';
import { Coach } from '../models/Coach.js';

export async function calculateDynamicPrice({ courtId, startTime, endTime, rackets = 0, shoes = 0, coachId = null }) {
  const court = await Court.findById(courtId);
  if (!court) throw new Error('Court not found');

  const durationHours = Math.max(1, (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
  const rules = await PricingRule.find({ isActive: true });

  let basePrice = court.basePricePerHour * durationHours;
  let peakHourFee = 0;
  let weekendFee = 0;
  let equipmentFee = 0;
  let coachFee = 0;

  const start = new Date(startTime);
  const day = start.getDay();
  const hour = start.getHours();

  for (const rule of rules) {
    if (rule.type === 'PEAK_HOUR' && typeof rule.startHour === 'number' && typeof rule.endHour === 'number') {
      if (hour >= rule.startHour && hour < rule.endHour) {
        peakHourFee += basePrice * (rule.multiplier - 1);
      }
    }
    if (rule.type === 'WEEKEND') {
      if (day === 0 || day === 6) {
        weekendFee += basePrice * (rule.multiplier - 1);
      }
    }
    if (rule.type === 'EQUIPMENT_FEE') {
      const items = (rackets || 0) + (shoes || 0);
      equipmentFee += items * (rule.equipmentFeePerItem || 0);
    }
  }

  if (coachId) {
    const coach = await Coach.findById(coachId);
    if (coach) coachFee = coach.hourlyRate * durationHours;
  }

  const total = basePrice + peakHourFee + weekendFee + equipmentFee + coachFee;
  return { basePrice, peakHourFee, weekendFee, equipmentFee, coachFee, total };
}

export async function getPriceQuote(req, res, next) {
  try {
    const { courtId, startTime, endTime, rackets, shoes, coachId } = req.body;
    const breakdown = await calculateDynamicPrice({ courtId, startTime, endTime, rackets, shoes, coachId });
    res.json(breakdown);
  } catch (err) {
    next(err);
  }
}
