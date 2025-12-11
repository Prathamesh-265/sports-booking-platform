import mongoose from 'mongoose';

const PricingRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['PEAK_HOUR', 'WEEKEND', 'EQUIPMENT_FEE'],
    required: true
  },
  startHour: { type: Number },
  endHour: { type: Number },
  appliesTo: { type: String, default: 'ALL' },
  multiplier: { type: Number, default: 1 },
  equipmentFeePerItem: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

export const PricingRule = mongoose.model('PricingRule', PricingRuleSchema);
