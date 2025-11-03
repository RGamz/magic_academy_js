import express from 'express';
import { getLesson, listPages } from '../controllers/contentController.js';

const router = express.Router();

router.get('/pages', listPages);
router.get('/lessons/:slug', getLesson);

export default router;
