import { Court } from '../models/Court.js';

export async function listCourts(req, res, next) {
  try {
    const courts = await Court.find({ isActive: true });
    res.json(courts);
  } catch (err) {
    next(err);
  }
}

export async function createCourt(req, res, next) {
  try {
    const court = await Court.create(req.body);
    res.status(201).json(court);
  } catch (err) {
    next(err);
  }
}
