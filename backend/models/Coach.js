import mongoose from 'mongoose';

const CoachSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, default: 'Badminton' },
  hourlyRate: { type: Number, default: 200 },
  isActive: { type: Boolean, default: true }
});

export const Coach = mongoose.model('Coach', CoachSchema);
