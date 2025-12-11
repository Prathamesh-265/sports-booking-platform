import express from 'express';
import { listCourts, createCourt } from '../controllers/courtController.js';

const router = express.Router();

router.get('/', listCourts);
router.post('/', createCourt);

export default router;
