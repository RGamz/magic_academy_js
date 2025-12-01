// backend/src/routes/bookRoutes.js
import express from 'express';
import { getAllBooks, getBookBySlug, getBookPage } from '../controllers/bookController.js';

const router = express.Router();

// GET /api/books - Get all books for library
router.get('/', getAllBooks);

// GET /api/books/:slug - Get book details with page data
router.get('/:slug', getBookBySlug);

// GET /api/books/:slug/page/:pageNum - Get specific page data
router.get('/:slug/page/:pageNum', getBookPage);

export default router;
