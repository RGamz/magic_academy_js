import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to vocabulary JSON file
const VOCABULARY_PATH = path.join(__dirname, '../../../data/vocabulary-fr-ru.json');

// Helper function to read vocabulary data
function readVocabularyData() {
  try {
    const data = fs.readFileSync(VOCABULARY_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading vocabulary data:', error);
    throw new Error('Failed to load vocabulary data');
  }
}

// GET /api/vocabulary/lessons - Get all lessons (metadata only)
export function getAllLessons(req, res) {
  try {
    const data = readVocabularyData();

    // Return lessons without full vocabulary arrays for overview
    const lessons = data.lessons.map(lesson => ({
      id: lesson.id,
      name: lesson.name,
      description: lesson.description,
      vocabularyCount: lesson.vocabulary.length
    }));

    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// GET /api/vocabulary/lessons/:lessonId - Get specific lesson with vocabulary
export function getLessonById(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const data = readVocabularyData();

    const lesson = data.lessons.find(l => l.id === lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: `Lesson with ID ${lessonId} not found`
      });
    }

    res.json({
      success: true,
      lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// GET /api/vocabulary/all - Get all vocabulary from all lessons
export function getAllVocabulary(req, res) {
  try {
    const data = readVocabularyData();

    // Flatten all vocabulary from all lessons
    const allVocabulary = data.lessons.reduce((acc, lesson) => {
      return acc.concat(lesson.vocabulary);
    }, []);

    res.json({
      success: true,
      vocabulary: allVocabulary,
      totalCount: allVocabulary.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
