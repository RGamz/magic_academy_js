// bulk-add-lessons-improved.js - Enhanced version that includes slugs
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

// Generate slug from title or use custom slug
function generateSlug(title, customSlug = null, lessonId = null) {
  if (customSlug) return customSlug;
  if (lessonId) return `lesson_${lessonId}`;
  
  // Fallback: create slug from title
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '_')      // Replace non-alphanumeric with underscore
    .replace(/^_+|_+$/g, '');          // Trim underscores
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

      // Insert lesson with all required fields including slug and description
      const titleId = insertTextTranslation(lessonData.title);
      const previewImageId = insertImage(lessonData.previewImage);
      const mainImageId = insertImage(lessonData.mainImage);
      
      // Handle description
      const descriptionId = lessonData.description 
        ? insertTextTranslation(lessonData.description) 
        : null;

      // ✅ FIXED: Insert the lesson and get its ID first
      const lessonResult = db.prepare(`
        INSERT INTO lessons (title_id, preview_image_id, main_image_id, description_id) 
        VALUES (?, ?, ?, ?)
      `).run(titleId, previewImageId, mainImageId, descriptionId);

      const lessonId = lessonResult.lastInsertRowid;
      
      // ✅ FIXED: Generate slug using the actual lesson ID
      const slug = lessonData.slug || generateSlug(lessonData.title, null, lessonId);
      const tag = lessonData.tag || 'Nouveau';
      
      // ✅ FIXED: Update the lesson with slug and tag
      db.prepare(`
        UPDATE lessons 
        SET slug = ?, tag = ?
        WHERE id = ?
      `).run(slug, tag, lessonId);

      lessonCount++;
      console.log(`  ✓ Created lesson ${lessonId} with slug: ${slug}`);

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

      console.log(`  ✓ ${lessonData.tasks?.length || 0} tasks added\n`);
    }

    return { lessonCount, taskCount };
  });

  const { lessonCount, taskCount } = bulkInsert();
  
  console.log('\n🎉 Bulk import complete!');
  console.log(`   ${lessonCount} lessons added`);
  console.log(`   ${taskCount} tasks added`);
  console.log('\n💡 Don\'t forget to restart Docker: docker compose restart\n');
}

// Get JSON file path from command line
const jsonFile = process.argv[2];

if (!jsonFile) {
  console.log(`
Usage: node bulk-add-lessons-improved.js <json-file>

Enhanced JSON format (now supports description, slug, tag):
{
  "lessons": [
    {
      "title": "Qu'est-ce qu'il y a dans ta chambre ?",
      "description": "Learn to describe your bedroom",
      "slug": "lesson_bedroom",  // Optional: auto-generated if not provided
      "tag": "Débutant",          // Optional: defaults to "Nouveau"
      "previewImage": "/assets/images/preview.jpg",
      "mainImage": "/assets/images/main.jpg",
      "tasks": [...]
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
