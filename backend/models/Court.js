import mongoose from 'mongoose';

const CourtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, default: 'Badminton' },
  basePricePerHour: { type: Number, default: 300 },
  isActive: { type: Boolean, default: true }
});

export const Court = mongoose.model('Court', CourtSchema);
