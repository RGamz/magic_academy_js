import express from 'express';
import { getAllLessons, getLessonById, getAllVocabulary } from '../controllers/vocabularyController.js';

const router = express.Router();

// Define API routes
router.get('/lessons', getAllLessons);              // GET /api/vocabulary/lessons - all lessons metadata
router.get('/lessons/:lessonId', getLessonById);    // GET /api/vocabulary/lessons/1 - specific lesson
router.get('/all', getAllVocabulary);               // GET /api/vocabulary/all - all vocabulary combined

export default router;
