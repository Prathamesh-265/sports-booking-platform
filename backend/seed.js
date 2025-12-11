import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Court } from './models/Court.js';
import { Coach } from './models/Coach.js';
import { PricingRule } from './models/PricingRule.js';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sports_booking';
  await mongoose.connect(uri, { dbName: 'sports_booking' });
  console.log('Connected to MongoDB for seeding');

  const court = await Court.findOneAndUpdate(
    { name: 'Court 1' },
    { name: 'Court 1', sport: 'Badminton', basePricePerHour: 300, isActive: true },
    { upsert: true, new: true }
  );
  console.log('Court created:', court._id);

  const coach = await Coach.findOneAndUpdate(
    { name: 'Coach A' },
    { name: 'Coach A', specialization: 'Badminton', hourlyRate: 200, isActive: true },
    { upsert: true, new: true }
  );
  console.log('Coach created:', coach._id);

  const pk = await PricingRule.findOneAndUpdate(
    { name: 'Evening Peak' },
    { name: 'Evening Peak', type: 'PEAK_HOUR', startHour: 18, endHour: 22, multiplier: 1.5, isActive: true },
    { upsert: true, new: true }
  );
  const wk = await PricingRule.findOneAndUpdate(
    { name: 'Weekend Surge' },
    { name: 'Weekend Surge', type: 'WEEKEND', multiplier: 1.3, isActive: true },
    { upsert: true, new: true }
  );
  const eq = await PricingRule.findOneAndUpdate(
    { name: 'Gear Fee' },
    { name: 'Gear Fee', type: 'EQUIPMENT_FEE', equipmentFeePerItem: 30, isActive: true },
    { upsert: true, new: true }
  );

  console.log('Pricing rules created');
  await mongoose.disconnect();
  console.log('Seeding complete, disconnected.');
}

main().catch(err => { console.error('Seeding error:', err); process.exit(1); });
