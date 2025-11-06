// backend/src/controllers/lessonController.js
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();
const db = new Database(process.env.DB_FILE || './data/magic_academy.sqlite');
db.pragma('foreign_keys = ON');

/**
 * Get all lessons with preview data (for home page)
 */
export function getAllLessons(req, res) {
  try {
    const lessons = db.prepare(`
      SELECT 
        l.id,
        tt.content as title,
        img_preview.file_path as cover,
        l.created_at
      FROM lessons l
      LEFT JOIN text_translations tt ON l.title_id = tt.id
      LEFT JOIN images img_preview ON l.preview_image_id = img_preview.id
      ORDER BY l.id ASC
    `).all();

    res.json({ success: true, data: lessons });
  } catch (error) {
    console.error('Error fetching all lessons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
  }
}

/**
 * Get lesson by ID with all tasks
 */
export function getLessonById(req, res) {
  try {
    const lessonId = parseInt(req.params.id);

    // Get lesson basic info
    const lesson = db.prepare(`
      SELECT 
        l.id,
        tt.content as title,
        img_main.file_path as mainImage,
        img_preview.file_path as previewImage
      FROM lessons l
      LEFT JOIN text_translations tt ON l.title_id = tt.id
      LEFT JOIN images img_main ON l.main_image_id = img_main.id
      LEFT JOIN images img_preview ON l.preview_image_id = img_preview.id
      WHERE l.id = ?
    `).get(lessonId);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Get all tasks for this lesson
    const tasks = db.prepare(`
      SELECT 
        lt.id,
        tt_title.content as title,
        tt_desc.content as description,
        audio.file_path as audio,
        img.file_path as image,
        g.path as game,
        lt.created_at
      FROM lesson_tasks lt
      LEFT JOIN text_translations tt_title ON lt.title_id = tt_title.id
      LEFT JOIN text_translations tt_desc ON lt.description_id = tt_desc.id
      LEFT JOIN audio_content audio ON lt.audio_id = audio.id
      LEFT JOIN images img ON lt.image_id = img.id
      LEFT JOIN games g ON lt.game_id = g.id
      WHERE lt.lesson_id = ?
      ORDER BY lt.id ASC
    `).all(lessonId);

    // Split description back into lines array
    const tasksWithLines = tasks.map(task => ({
      ...task,
      lines: task.description ? task.description.split('\n') : [],
      description: undefined // remove the raw description field
    }));

    const result = {
      ...lesson,
      tasks: tasksWithLines
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching lesson by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson' });
  }
}

/**
 * Get lesson by slug (for backward compatibility with ?id=lesson_1)
 * We'll store slug in a new column or use a mapping table
 * For now, using ID-based approach
 */
export function getLessonBySlug(req, res) {
  try {
    const slug = req.params.slug;
    
    // Simple mapping: extract number from slug (lesson_1 -> 1)
    const match = slug.match(/lesson_(\d+)/);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid slug format' });
    }

    const lessonId = parseInt(match[1]);
    req.params.id = lessonId;
    
    return getLessonById(req, res);
  } catch (error) {
    console.error('Error fetching lesson by slug:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson' });
  }
}
