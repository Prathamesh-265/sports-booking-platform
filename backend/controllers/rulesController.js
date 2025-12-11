// backend/controllers/rulesController.js
import { PricingRule } from '../models/PricingRule.js';

/**
 * List rules
 */
export async function listRules(req, res, next) {
  try {
    const rules = await PricingRule.find().sort({ name: 1 });
    res.json(rules);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new pricing rule with input validation.
 * Returns 400 on bad input.
 */
export async function createRule(req, res, next) {
  try {
    const body = req.body || {};

    // Basic validation
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return res.status(400).json({ message: 'Rule name is required.' });
    }
    if (!body.type || !['PEAK_HOUR', 'WEEKEND', 'EQUIPMENT_FEE'].includes(body.type)) {
      return res.status(400).json({ message: 'Rule type is required and must be one of PEAK_HOUR, WEEKEND, EQUIPMENT_FEE.' });
    }

    // Normalize numeric fields
    if (body.startHour !== undefined) body.startHour = body.startHour === null ? null : Number(body.startHour);
    if (body.endHour !== undefined) body.endHour = body.endHour === null ? null : Number(body.endHour);
    if (body.multiplier !== undefined) body.multiplier = Number(body.multiplier) || 0;
    if (body.equipmentFeePerItem !== undefined) body.equipmentFeePerItem = Number(body.equipmentFeePerItem) || 0;

    const rule = await PricingRule.create({
      name: body.name.trim(),
      type: body.type,
      startHour: body.startHour,
      endHour: body.endHour,
      multiplier: body.multiplier,
      equipmentFeePerItem: body.equipmentFeePerItem,
      appliesTo: body.appliesTo || 'ALL',
      isActive: body.isActive === undefined ? true : Boolean(body.isActive)
    });

    return res.status(201).json(rule);
  } catch (err) {
    next(err);
  }
}
