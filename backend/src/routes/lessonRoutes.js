import express from 'express';
import { getLessonById } from '../controllers/lessonController.js';

const router = express.Router();

// Define API routes
router.get('/:id', getLessonById);

// Default export for ES Modules
export default router;
