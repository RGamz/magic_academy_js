import express from 'express';
import { getGameData } from '../controllers/gameController.js';

const router = express.Router();

// Define API routes
router.get('/:id', getGameData);  // GET /api/games/reorder_game_1

// Default export for ES Modules
export default router;
