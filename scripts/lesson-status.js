// scripts/lesson-status.js
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database(process.env.DB_FILE || './data/magic_academy.sqlite');

console.log('\n📚 Lesson Database Status');
console.log('═════════════════════════════════════════════════════\n');

// Overall statistics
const stats = db.prepare(`
  SELECT 
    (SELECT COUNT(*) FROM lessons) as total_lessons,
    (SELECT COUNT(*) FROM lesson_tasks) as total_tasks,
    (SELECT COUNT(*) FROM images) as total_images,
    (SELECT COUNT(*) FROM audio_content) as total_audio,
    (SELECT COUNT(*) FROM games) as total_games
`).get();

console.log('📊 Statistics:');
console.log(`   Lessons: ${stats.total_lessons}`);
console.log(`   Tasks: ${stats.total_tasks}`);
console.log(`   Images: ${stats.total_images}`);
console.log(`   Audio files: ${stats.total_audio}`);
console.log(`   Games: ${stats.total_games}`);

// Recent lessons
console.log('\n📖 Recent Lessons:');
console.log('─────────────────────────────────────────────────────');

const recentLessons = db.prepare(`
  SELECT 
    l.id,
    tt.content as title,
    (SELECT COUNT(*) FROM lesson_tasks WHERE lesson_id = l.id) as task_count,
    img.file_path as preview,
    l.created_at
  FROM lessons l
  LEFT JOIN text_translations tt ON l.title_id = tt.id
  LEFT JOIN images img ON l.preview_image_id = img.id
  ORDER BY l.id DESC
  LIMIT 10
`).all();

recentLessons.forEach(lesson => {
  console.log(`\n   ID: ${lesson.id}`);
  console.log(`   Title: ${lesson.title}`);
  console.log(`   Tasks: ${lesson.task_count}`);
  console.log(`   Preview: ${lesson.preview || 'None'}`);
  console.log(`   Created: ${lesson.created_at}`);
});

// Lessons without tasks
console.log('\n\n⚠️  Lessons Without Tasks:');
console.log('─────────────────────────────────────────────────────');

const lessonsWithoutTasks = db.prepare(`
  SELECT l.id, tt.content as title
  FROM lessons l
  JOIN text_translations tt ON l.title_id = tt.id
  WHERE l.id NOT IN (SELECT DISTINCT lesson_id FROM lesson_tasks)
`).all();

if (lessonsWithoutTasks.length === 0) {
  console.log('   ✅ All lessons have tasks!');
} else {
  lessonsWithoutTasks.forEach(lesson => {
    console.log(`   - Lesson ${lesson.id}: ${lesson.title}`);
  });
}

// Tasks without audio
console.log('\n\n🔇 Tasks Without Audio:');
console.log('─────────────────────────────────────────────────────');

const tasksWithoutAudio = db.prepare(`
  SELECT 
    lt.id,
    tt.content as title,
    l.id as lesson_id
  FROM lesson_tasks lt
  JOIN text_translations tt ON lt.title_id = tt.id
  JOIN lessons l ON lt.lesson_id = l.id
  WHERE lt.audio_id IS NULL
  LIMIT 5
`).all();

if (tasksWithoutAudio.length === 0) {
  console.log('   ✅ All tasks have audio!');
} else {
  console.log(`   Found ${tasksWithoutAudio.length} tasks without audio (showing first 5):`);
  tasksWithoutAudio.forEach(task => {
    console.log(`   - Task ${task.id} (Lesson ${task.lesson_id}): ${task.title}`);
  });
}

// Latest additions
console.log('\n\n🆕 Latest Additions (Last 24 hours):');
console.log('─────────────────────────────────────────────────────');

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const recentAdditions = db.prepare(`
  SELECT 
    l.id,
    tt.content as title,
    l.created_at
  FROM lessons l
  JOIN text_translations tt ON l.title_id = tt.id
  WHERE l.created_at >= ?
  ORDER BY l.created_at DESC
`).all(yesterday);

if (recentAdditions.length === 0) {
  console.log('   No lessons added in the last 24 hours');
} else {
  recentAdditions.forEach(lesson => {
    console.log(`   - Lesson ${lesson.id}: ${lesson.title}`);
    console.log(`     Added: ${lesson.created_at}`);
  });
}

console.log('\n═════════════════════════════════════════════════════\n');

db.close();
