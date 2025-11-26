// scripts/add-video-to-lesson.js
// Add a YouTube video or external link to an existing lesson as a new task
//
// Usage:
//   node scripts/add-video-to-lesson.js <lesson_id_or_slug> <url> [options]
//
// Examples:
//   node scripts/add-video-to-lesson.js 5 "https://www.youtube.com/watch?v=abc123" --title "Regarde la vidéo"
//   node scripts/add-video-to-lesson.js lesson_5 "https://example.com/resource" --title "Ressource externe" --type link
//   node scripts/add-video-to-lesson.js 3 "https://youtu.be/abc123" --title "Chanson française" --lines "Écoute et répète"

import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database(process.env.DB_FILE || './data/magic_academy.sqlite');
db.pragma('foreign_keys = ON');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
📹 Add Video/Link to Existing Lesson
═════════════════════════════════════════════════════

Usage:
  node scripts/add-video-to-lesson.js <lesson_id_or_slug> <url> [options]

Options:
  --title <text>    Task title (default: "Regarde la vidéo" for YouTube, "Lien externe" for others)
  --lines <text>    Task description/instructions (can use \\n for newlines)
  --type <type>     Link type: "youtube" or "link" (auto-detected from URL if not specified)

Examples:
  # Add YouTube video to lesson 5
  node scripts/add-video-to-lesson.js 5 "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --title "Chanson française"

  # Add YouTube video with instructions
  node scripts/add-video-to-lesson.js lesson_3 "https://youtu.be/abc123" --title "Regarde et répète" --lines "1. Écoute bien\\n2. Répète les mots"

  # Add regular link
  node scripts/add-video-to-lesson.js 7 "https://example.com/exercise" --title "Exercice en ligne" --type link
    `);
    process.exit(1);
  }

  const lessonIdOrSlug = args[0];
  const url = args[1];
  
  // Parse optional flags
  const options = {
    title: null,
    lines: null,
    type: null
  };

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      options.title = args[++i];
    } else if (args[i] === '--lines' && args[i + 1]) {
      options.lines = args[++i].replace(/\\n/g, '\n');
    } else if (args[i] === '--type' && args[i + 1]) {
      options.type = args[++i];
    }
  }

  return { lessonIdOrSlug, url, options };
}

// Detect if URL is YouTube
function isYouTubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
}

// Helper functions
function insertTextTranslation(text, languageId = 1) {
  const result = db.prepare(
    'INSERT INTO text_translations (content, language_id) VALUES (?, ?)'
  ).run(text, languageId);
  return result.lastInsertRowid;
}

function insertExternalLink(url, type) {
  // Check if link already exists
  const existing = db.prepare('SELECT id FROM external_links WHERE link = ?').get(url);
  if (existing) return existing.id;
  
  const result = db.prepare(
    'INSERT INTO external_links (link, type) VALUES (?, ?)'
  ).run(url, type);
  return result.lastInsertRowid;
}

function getLessonId(lessonIdOrSlug) {
  // Try as numeric ID first
  const numericId = parseInt(lessonIdOrSlug);
  if (!isNaN(numericId)) {
    const lesson = db.prepare('SELECT id FROM lessons WHERE id = ?').get(numericId);
    if (lesson) return lesson.id;
  }
  
  // Try as slug
  const lesson = db.prepare('SELECT id FROM lessons WHERE slug = ?').get(lessonIdOrSlug);
  if (lesson) return lesson.id;
  
  return null;
}

function getLessonTitle(lessonId) {
  const result = db.prepare(`
    SELECT tt.content as title 
    FROM lessons l 
    JOIN text_translations tt ON l.title_id = tt.id 
    WHERE l.id = ?
  `).get(lessonId);
  return result?.title || `Lesson ${lessonId}`;
}

// Main function
function addVideoToLesson() {
  const { lessonIdOrSlug, url, options } = parseArgs();

  console.log('\n📹 Adding Video/Link to Lesson');
  console.log('═════════════════════════════════════════════════════\n');

  // Find lesson
  const lessonId = getLessonId(lessonIdOrSlug);
  if (!lessonId) {
    console.error(`❌ Lesson not found: ${lessonIdOrSlug}`);
    console.log('   Use lesson ID (number) or slug (e.g., "lesson_5")');
    process.exit(1);
  }

  const lessonTitle = getLessonTitle(lessonId);
  console.log(`📚 Lesson: ${lessonTitle} (ID: ${lessonId})`);

  // Determine link type
  const linkType = options.type || (isYouTubeUrl(url) ? 'youtube' : 'link');
  console.log(`🔗 Link type: ${linkType}`);
  console.log(`🌐 URL: ${url}`);

  // Get admin user
  const adminUser = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminUser) {
    console.error('❌ No admin user found. Run migrations first.');
    process.exit(1);
  }

  // Determine task title and description
  const taskTitle = options.title || (linkType === 'youtube' ? 'Regarde la vidéo' : 'Lien externe');
  const taskLines = options.lines || (linkType === 'youtube' 
    ? 'Regarde cette vidéo attentivement.' 
    : 'Clique sur le lien pour accéder à la ressource.');

  console.log(`📝 Task title: ${taskTitle}`);

  // Insert in transaction
  const addTask = db.transaction(() => {
    // Insert external link
    const externalLinkId = insertExternalLink(url, linkType);
    console.log(`   ✓ External link created (ID: ${externalLinkId})`);

    // Insert task title and description
    const titleId = insertTextTranslation(taskTitle);
    const descriptionId = insertTextTranslation(taskLines);

    // Insert the task
    const taskResult = db.prepare(`
      INSERT INTO lesson_tasks (
        title_id, description_id, external_link_id, added_by, lesson_id
      ) VALUES (?, ?, ?, ?, ?)
    `).run(titleId, descriptionId, externalLinkId, adminUser.id, lessonId);

    console.log(`   ✓ Task created (ID: ${taskResult.lastInsertRowid})`);

    return taskResult.lastInsertRowid;
  });

  try {
    const taskId = addTask();
    
    console.log('\n✅ Success! Video/link added to lesson.');
    console.log(`\n💡 View the lesson at: /lesson.html?id=lesson_${lessonId}`);
    console.log('   Don\'t forget to restart Docker: docker compose restart\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

addVideoToLesson();
db.close();