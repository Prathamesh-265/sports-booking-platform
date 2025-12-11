import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

const BookingSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  court: { type: ObjectId, ref: 'Court', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  resources: {
    rackets: { type: Number, default: 0 },
    shoes: { type: Number, default: 0 },
    coach: { type: ObjectId, ref: 'Coach', required: false }
  },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  pricingBreakdown: {
    basePrice: Number,
    peakHourFee: Number,
    weekendFee: Number,
    equipmentFee: Number,
    coachFee: Number,
    total: Number
  },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.model('Booking', BookingSchema);
