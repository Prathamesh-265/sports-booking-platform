import express from 'express';
import { listCoaches, createCoach } from '../controllers/coachController.js';

const router = express.Router();

router.get('/', listCoaches);
router.post('/', createCoach);

export default router;
