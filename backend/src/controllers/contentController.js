import { fetchLessonBySlug, fetchPages } from '../models/contentModel.js';

export function listPages(req, res) {
  try {
    const pages = fetchPages();
    res.json({ success: true, data: { pages } });
  } catch (error) {
    console.error('Failed to load pages from database', error);
    res.status(500).json({ success: false, message: 'Unable to load pages' });
  }
}

export function getLesson(req, res) {
  try {
    const { slug } = req.params;
    const lesson = fetchLessonBySlug(slug);
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson not found' });
      return;
    }

    res.json({ success: true, data: { lesson } });
  } catch (error) {
    console.error('Failed to load lesson from database', error);
    res.status(500).json({ success: false, message: 'Unable to load lesson' });
  }
}
