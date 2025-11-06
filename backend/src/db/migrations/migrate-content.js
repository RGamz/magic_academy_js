// backend/src/db/migrations/migrate-content.js
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const dbPath = process.env.DB_FILE || './data/magic_academy.sqlite';
const contentJsonPath = './data/content.json';

// Connect to DB
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('🚀 Starting migration from content.json to SQLite...\n');

// Read content.json
const content = JSON.parse(fs.readFileSync(contentJsonPath, 'utf-8'));

// Helper functions
function insertLanguage(code) {
  const existing = db.prepare('SELECT id FROM languages WHERE code = ?').get(code);
  if (existing) return existing.id;
  
  const result = db.prepare('INSERT INTO languages (code) VALUES (?)').run(code);
  return result.lastInsertRowid;
}

function insertTextTranslation(text, languageId) {
  const result = db.prepare(
    'INSERT INTO text_translations (content, language_id) VALUES (?, ?)'
  ).run(text, languageId);
  return result.lastInsertRowid;
}

function insertImage(filePath) {
  // Check if image already exists
  const existing = db.prepare('SELECT id FROM images WHERE file_path = ?').get(filePath);
  if (existing) return existing.id;
  
  const result = db.prepare('INSERT INTO images (file_path) VALUES (?)').run(filePath);
  return result.lastInsertRowid;
}

function insertAudio(filePath, languageId) {
  // Check if audio already exists
  const existing = db.prepare(
    'SELECT id FROM audio_content WHERE file_path = ? AND language_id = ?'
  ).get(filePath, languageId);
  if (existing) return existing.id;
  
  const result = db.prepare(
    'INSERT INTO audio_content (file_path, language_id) VALUES (?, ?)'
  ).run(filePath, languageId);
  return result.lastInsertRowid;
}

function insertGame(title, gamePath) {
  const existing = db.prepare('SELECT id FROM games WHERE path = ?').get(gamePath);
  if (existing) return existing.id;
  
  const result = db.prepare(
    'INSERT INTO games (title, path) VALUES (?, ?)'
  ).run(title, gamePath);
  return result.lastInsertRowid;
}

// Start migration in a transaction
const migrate = db.transaction(() => {
  // 1. Insert French language
  const frId = insertLanguage('fr');
  console.log(`✓ Language inserted: French (id: ${frId})`);

  // 2. Create a default admin user for tasks (required by foreign key)
  let adminUserId;
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@academy.fr');
  if (existingAdmin) {
    adminUserId = existingAdmin.id;
  } else {
    const adminResult = db.prepare(`
      INSERT INTO users (nickname, email, password, role) 
      VALUES (?, ?, ?, ?)
    `).run('Admin', 'admin@academy.fr', 'admin', 'admin');
    adminUserId = adminResult.lastInsertRowid;
  }
  console.log(`✓ Admin user ready (id: ${adminUserId})\n`);

  // 3. Migrate lessons
  let lessonsCount = 0;
  let tasksCount = 0;

  for (const [lessonSlug, lessonData] of Object.entries(content.lessons || {})) {
    console.log(`Processing lesson: ${lessonSlug}`);

    // Insert title translation
    const titleId = insertTextTranslation(lessonData.title || lessonSlug, frId);

    // Insert main image if exists
    let mainImageId = null;
    if (lessonData.mainImage) {
      mainImageId = insertImage(lessonData.mainImage);
    }

    // Find preview image from pages array
    let previewImageId = null;
    const pageData = (content.pages || []).find(p => p.slug === lessonSlug);
    if (pageData && pageData.cover) {
      previewImageId = insertImage(pageData.cover);
    }

    // Insert lesson
    const lessonResult = db.prepare(`
      INSERT INTO lessons (title_id, preview_image_id, main_image_id) 
      VALUES (?, ?, ?)
    `).run(titleId, previewImageId, mainImageId);
    const lessonId = lessonResult.lastInsertRowid;
    lessonsCount++;

    console.log(`  ✓ Lesson created (id: ${lessonId})`);

    // Insert tasks for this lesson
    for (const [taskIndex, task] of (lessonData.tasks || []).entries()) {
      // Insert task title
      const taskTitleId = insertTextTranslation(
        task.title || `Task ${taskIndex + 1}`, 
        frId
      );

      // Insert task description (combine lines into one text)
      const descriptionText = (task.lines || []).join('\n');
      const taskDescId = insertTextTranslation(descriptionText, frId);

      // Insert audio if exists
      let audioId = null;
      if (task.audio) {
        audioId = insertAudio(task.audio, frId);
      } else if (task.audios && task.audios.length > 0) {
        // For multiple audios, insert first one (you may want to handle this differently)
        audioId = insertAudio(task.audios[0], frId);
      }

      // Insert task image if exists
      let taskImageId = null;
      if (task.image) {
        taskImageId = insertImage(task.image);
      }

      // Insert game if exists
      let gameId = null;
      if (task.game) {
        gameId = insertGame(`Game for ${lessonSlug} task ${taskIndex + 1}`, task.game);
      }

      // Insert the task
      db.prepare(`
        INSERT INTO lesson_tasks (
          title_id, audio_id, image_id, description_id, 
          game_id, added_by, lesson_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(taskTitleId, audioId, taskImageId, taskDescId, gameId, adminUserId, lessonId);

      tasksCount++;
    }

    console.log(`  ✓ ${lessonData.tasks?.length || 0} tasks inserted\n`);
  }

  console.log('\n🎉 Migration completed successfully!');
  console.log(`   - ${lessonsCount} lessons migrated`);
  console.log(`   - ${tasksCount} tasks migrated`);
});

// Run migration
try {
  migrate();
  console.log('\n✅ All data migrated to database');
} catch (error) {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
