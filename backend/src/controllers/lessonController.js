// backend/src/controllers/lessonController.js
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();
const db = new Database(process.env.DB_FILE || './data/magic_academy.sqlite');
db.pragma('foreign_keys = ON');

/**
 * Get all lessons with preview data (for home page)
 * Returns format compatible with content.json pages array
 */
export function getAllLessons(req, res) {
  try {
    const lessons = db.prepare(`
      SELECT
        l.id,
        l.slug,
        tt.content as title,
        tt_desc.content as description,
        img_preview.file_path as cover,
        l.tag,
        l.created_at,
        COUNT(lt.id) as task_count
      FROM lessons l
      LEFT JOIN text_translations tt ON l.title_id = tt.id
      LEFT JOIN text_translations tt_desc ON l.description_id = tt_desc.id
      LEFT JOIN images img_preview ON l.preview_image_id = img_preview.id
      LEFT JOIN lesson_tasks lt ON l.id = lt.lesson_id
      WHERE l.slug IS NOT NULL
      GROUP BY l.id
      ORDER BY l.id ASC
    `).all();

    // Add calculated duration based on task_count * 4 min
    const lessonsWithDuration = lessons.map(lesson => ({
      ...lesson,
      duration: `${lesson.task_count * 4} min`
    }));

    res.json({ success: true, data: lessonsWithDuration });
  } catch (error) {
    console.error('Error fetching all lessons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
  }
}

/**
 * Get lesson by ID with all tasks
 * Returns format compatible with content.json lesson structure
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

    // Split description back into lines array and format for frontend
    const tasksWithLines = tasks.map(task => {
      const result = {
        title: task.title,
        lines: task.description ? task.description.split('\n') : []
      };

      // Add audio if present
      if (task.audio) {
        result.audio = task.audio;
      }

      // Add image if present
      if (task.image) {
        result.image = task.image;
      }

      // Add game if present
      if (task.game) {
        result.game = task.game;
      }

      return result;
    });

    const result = {
      title: lesson.title,
      mainImage: lesson.mainImage,
      breadcrumb: [lesson.title], // Simple breadcrumb for now
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
 * Looks up lesson by slug field in database
 */
export function getLessonBySlug(req, res) {
  try {
    const slug = req.params.slug;

    // Get lesson ID from slug
    const lessonRecord = db.prepare('SELECT id FROM lessons WHERE slug = ?').get(slug);

    if (!lessonRecord) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Use the ID to get full lesson data
    req.params.id = lessonRecord.id;
    return getLessonById(req, res);
  } catch (error) {
    console.error('Error fetching lesson by slug:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson' });
  }
}
