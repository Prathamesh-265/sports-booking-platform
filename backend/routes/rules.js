import express from 'express';
import { listRules, createRule } from '../controllers/rulesController.js';

const router = express.Router();

router.get('/', listRules);
router.post('/', createRule);

export default router;
