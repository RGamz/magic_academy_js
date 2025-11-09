import express from 'express';
import { getAllLessons, getLessonById, getLessonBySlug } from '../controllers/lessonController.js';

const router = express.Router();

// Define API routes
router.get('/', getAllLessons);                    // GET /api/lessons - all lessons
router.get('/slug/:slug', getLessonBySlug);        // GET /api/lessons/slug/lesson_1
router.get('/:id', getLessonById);                 // GET /api/lessons/1

// Default export for ES Modules
export default router;
