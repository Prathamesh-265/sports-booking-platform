import { Coach } from '../models/Coach.js';

export async function listCoaches(req, res, next) {
  try {
    const coaches = await Coach.find({ isActive: true });
    res.json(coaches);
  } catch (err) {
    next(err);
  }
}

export async function createCoach(req, res, next) {
  try {
    const coach = await Coach.create(req.body);
    res.status(201).json(coach);
  } catch (err) {
    next(err);
  }
}
