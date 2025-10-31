// backend/src/controllers/lessonController.js
import path from 'path';
import { readJSON } from '../utils/fileReader.js';
import config from '../config/config.js';

export async function getLessonById(req, res) {
  try {
    const lessonId = req.params.id;
    const filePath = path.join(config.lessonsDirectory, `${lessonId}.json`);
    const lessonData = await readJSON(filePath);
    res.json({ success: true, data: lessonData });
  } catch (error) {
    console.error('Error in getLessonById:', error);
    res.status(404).json({ success: false, message: 'Lesson not found' });
  }
}
