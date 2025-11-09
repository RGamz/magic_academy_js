// Populate slug, description, and tag fields from content.json
import Database from 'better-sqlite3';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const db = new Database(process.env.DB_FILE || './data/magic_academy.sqlite');
db.pragma('foreign_keys = ON');

// Read the content.json file
const content = JSON.parse(fs.readFileSync('./data/content.json', 'utf-8'));

console.log('Populating preview data from content.json...\n');

// Get the French language ID
const frenchLang = db.prepare('SELECT id FROM languages WHERE code = ?').get('fr');
if (!frenchLang) {
  console.error('French language not found in database. Please add it first.');
  process.exit(1);
}

const languageId = frenchLang.id;

// Process each page in content.json
for (const page of content.pages) {
  console.log(`Processing: ${page.slug} - ${page.title}`);

  // Extract lesson number from slug (e.g., "lesson_1" -> 1)
  const match = page.slug.match(/lesson_(\d+)/);
  if (!match) {
    console.warn(`  ⚠️  Skipping ${page.slug} - invalid slug format`);
    continue;
  }

  const lessonId = parseInt(match[1]);

  // Check if lesson exists
  const lesson = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId);
  if (!lesson) {
    console.warn(`  ⚠️  Lesson ${lessonId} not found in database`);
    continue;
  }

  // Insert or get description text_translation
  let descriptionId = null;
  if (page.description) {
    // Check if description already exists
    const existingDesc = db.prepare(
      'SELECT id FROM text_translations WHERE content = ? AND language_id = ?'
    ).get(page.description, languageId);

    if (existingDesc) {
      descriptionId = existingDesc.id;
    } else {
      // Insert new description
      const result = db.prepare(
        'INSERT INTO text_translations (content, language_id) VALUES (?, ?)'
      ).run(page.description, languageId);
      descriptionId = result.lastInsertRowid;
    }
  }

  // Update lesson with slug, description_id, and tag
  db.prepare(`
    UPDATE lessons
    SET slug = ?, description_id = ?, tag = ?
    WHERE id = ?
  `).run(page.slug, descriptionId, page.tag || null, lessonId);

  console.log(`  ✅ Updated lesson ${lessonId} with preview data`);
}

console.log('\n✅ Preview data population complete!');
db.close();
