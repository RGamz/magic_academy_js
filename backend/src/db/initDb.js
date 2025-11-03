import { escapeSqlValue, runQuery, runStatement } from './connection.js';
import { lessons, pages, reorderGames } from './seedData.js';

function createTables() {
  runStatement(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      cover TEXT,
      tag TEXT
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT,
      main_image TEXT,
      image_alt TEXT,
      breadcrumb_json TEXT
    );

    CREATE TABLE IF NOT EXISTS lesson_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_slug TEXT NOT NULL,
      position INTEGER NOT NULL,
      title TEXT,
      game TEXT,
      FOREIGN KEY (lesson_slug) REFERENCES lessons(slug) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_task_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      content TEXT,
      FOREIGN KEY (task_id) REFERENCES lesson_tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_task_audios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      src TEXT,
      FOREIGN KEY (task_id) REFERENCES lesson_tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reorder_games (
      id INTEGER PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS reorder_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      image TEXT,
      sentence_json TEXT,
      audio TEXT,
      FOREIGN KEY (game_id) REFERENCES reorder_games(id) ON DELETE CASCADE
    );
  `);
}

function tableCount(tableName) {
  const rows = runQuery(`SELECT COUNT(*) AS count FROM ${tableName};`);
  return rows.length ? Number(rows[0].count) : 0;
}

function seedPages() {
  if (tableCount('pages') > 0) return;

  const statements = ['BEGIN TRANSACTION;'];
  pages.forEach((page, index) => {
    statements.push(
      `INSERT INTO pages (id, slug, title, description, cover, tag) VALUES (${index + 1}, ${escapeSqlValue(page.slug)}, ${escapeSqlValue(page.title)}, ${escapeSqlValue(page.description)}, ${escapeSqlValue(page.cover)}, ${escapeSqlValue(page.tag)});`
    );
  });
  statements.push('COMMIT;');
  runStatement(statements.join('\n'));
}

function seedLessons() {
  if (tableCount('lessons') > 0) return;

  const statements = ['BEGIN TRANSACTION;'];
  let lessonId = 1;
  let taskId = 1;
  let lineId = 1;
  let audioId = 1;

  Object.entries(lessons).forEach(([slug, lesson]) => {
    statements.push(
      `INSERT INTO lessons (id, slug, title, main_image, image_alt, breadcrumb_json) VALUES (${lessonId}, ${escapeSqlValue(slug)}, ${escapeSqlValue(lesson.title)}, ${escapeSqlValue(lesson.mainImage)}, ${escapeSqlValue(lesson.imageAlt)}, ${escapeSqlValue(JSON.stringify(lesson.breadcrumb || []))});`
    );

    const tasks = Array.isArray(lesson.tasks) ? lesson.tasks : [];
    tasks.forEach((task, index) => {
      const currentTaskId = taskId++;
      statements.push(
        `INSERT INTO lesson_tasks (id, lesson_slug, position, title, game) VALUES (${currentTaskId}, ${escapeSqlValue(slug)}, ${index}, ${escapeSqlValue(task.title)}, ${escapeSqlValue(task.game)});`
      );

      const lines = Array.isArray(task.lines) ? task.lines : [];
      lines.forEach((line, lineIndex) => {
        statements.push(
          `INSERT INTO lesson_task_lines (id, task_id, position, content) VALUES (${lineId++}, ${currentTaskId}, ${lineIndex}, ${escapeSqlValue(line)});`
        );
      });

      let audioSources = [];
      if (Array.isArray(task.audios)) {
        audioSources = task.audios;
      } else if (task.audio) {
        audioSources = [task.audio];
      }

      audioSources.forEach((src, audioIndex) => {
        statements.push(
          `INSERT INTO lesson_task_audios (id, task_id, position, src) VALUES (${audioId++}, ${currentTaskId}, ${audioIndex}, ${escapeSqlValue(src)});`
        );
      });
    });

    lessonId += 1;
  });

  statements.push('COMMIT;');
  runStatement(statements.join('\n'));
}

function seedReorderGames() {
  if (tableCount('reorder_games') > 0) return;

  const statements = ['BEGIN TRANSACTION;'];
  let levelId = 1;

  reorderGames.forEach((game) => {
    statements.push(
      `INSERT INTO reorder_games (id, slug, title, description) VALUES (${game.id}, ${escapeSqlValue(game.slug)}, ${escapeSqlValue(game.title)}, ${escapeSqlValue(game.description)});`
    );

    const levels = Array.isArray(game.levels) ? game.levels : [];
    levels.forEach((level, index) => {
      statements.push(
        `INSERT INTO reorder_levels (id, game_id, position, image, sentence_json, audio) VALUES (${levelId++}, ${game.id}, ${index}, ${escapeSqlValue(level.image)}, ${escapeSqlValue(JSON.stringify(level.sentence || []))}, ${escapeSqlValue(level.audio)});`
      );
    });
  });

  statements.push('COMMIT;');
  runStatement(statements.join('\n'));
}

export function initializeDatabase() {
  createTables();
  seedPages();
  seedLessons();
  seedReorderGames();
}
