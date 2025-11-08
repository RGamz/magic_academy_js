// scripts/bulk-add-lessons.js
import fs from 'fs';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database(process.env.DB_FILE || './data/magic_academy.sqlite');
db.pragma('foreign_keys = ON');

// Helper functions
function insertTextTranslation(text, languageId = 1) {
  const result = db.prepare(
    'INSERT INTO text_translations (content, language_id) VALUES (?, ?)'
  ).run(text, languageId);
  return result.lastInsertRowid;
}

function insertImage(filePath) {
  if (!filePath) return null;
  const existing = db.prepare('SELECT id FROM images WHERE file_path = ?').get(filePath);
  if (existing) return existing.id;
  const result = db.prepare('INSERT INTO images (file_path) VALUES (?)').run(filePath);
  return result.lastInsertRowid;
}

function insertAudio(filePath, languageId = 1) {
  if (!filePath) return null;
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
  if (!gamePath) return null;
  const existing = db.prepare('SELECT id FROM games WHERE path = ?').get(gamePath);
  if (existing) return existing.id;
  const result = db.prepare(
    'INSERT INTO games (title, path) VALUES (?, ?)'
  ).run(title, gamePath);
  return result.lastInsertRowid;
}

// Main function
function bulkAddLessons(jsonFilePath) {
  console.log(`\n📦 Bulk adding lessons from: ${jsonFilePath}\n`);

  // Read JSON file
  const lessonsData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  // Get admin user
  const adminUser = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminUser) {
    console.error('❌ No admin user found. Run migration first.');
    process.exit(1);
  }

  const bulkInsert = db.transaction(() => {
    let lessonCount = 0;
    let taskCount = 0;

    for (const lessonData of lessonsData.lessons || []) {
      console.log(`Processing: ${lessonData.title}`);

      // Insert lesson
      const titleId = insertTextTranslation(lessonData.title);
      const previewImageId = insertImage(lessonData.previewImage);
      const mainImageId = insertImage(lessonData.mainImage);

      const lessonResult = db.prepare(`
        INSERT INTO lessons (title_id, preview_image_id, main_image_id) 
        VALUES (?, ?, ?)
      `).run(titleId, previewImageId, mainImageId);

      const lessonId = lessonResult.lastInsertRowid;
      lessonCount++;

      // Insert tasks
      for (const task of lessonData.tasks || []) {
        const taskTitleId = insertTextTranslation(task.title);
        const taskDescId = insertTextTranslation(
          Array.isArray(task.lines) ? task.lines.join('\n') : task.lines || ''
        );
        const audioId = insertAudio(task.audio);
        const imageId = insertImage(task.image);
        const gameId = insertGame(task.title, task.game);

        db.prepare(`
          INSERT INTO lesson_tasks (
            title_id, audio_id, image_id, description_id, 
            game_id, added_by, lesson_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(taskTitleId, audioId, imageId, taskDescId, gameId, adminUser.id, lessonId);

        taskCount++;
      }

      console.log(`  ✓ ${lessonData.tasks?.length || 0} tasks added`);
    }

    return { lessonCount, taskCount };
  });

  const { lessonCount, taskCount } = bulkInsert();
  
  console.log('\n🎉 Bulk import complete!');
  console.log(`   ${lessonCount} lessons added`);
  console.log(`   ${taskCount} tasks added\n`);
}

// Get JSON file path from command line
const jsonFile = process.argv[2];

if (!jsonFile) {
  console.log(`
Usage: node scripts/bulk-add-lessons.js <json-file>

Example JSON format:
{
  "lessons": [
    {
      "title": "Lesson 20 — Title",
      "previewImage": "/assets/images/preview.jpg",
      "mainImage": "/assets/images/main.jpg",
      "tasks": [
        {
          "title": "Task 1: Listen and repeat",
          "lines": ["Line 1", "Line 2"],
          "audio": "/assets/audio/lesson20.mp3",
          "image": "/assets/images/task1.jpg",
          "game": "../games/game1.html"
        }
      ]
    }
  ]
}
  `);
  process.exit(1);
}

if (!fs.existsSync(jsonFile)) {
  console.error(`❌ File not found: ${jsonFile}`);
  process.exit(1);
}

bulkAddLessons(jsonFile);
db.close();
