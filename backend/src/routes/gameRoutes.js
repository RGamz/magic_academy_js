import express from 'express';
import { getReorderGame } from '../controllers/gameController.js';

const router = express.Router();

router.get('/reorder/:idOrSlug', getReorderGame);

export default router;
