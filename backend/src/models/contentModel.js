import { escapeSqlValue, runQuery } from '../db/connection.js';

export function fetchPages() {
  return runQuery('SELECT slug, title, description, cover, tag FROM pages ORDER BY id;');
}

export function fetchLessonBySlug(slug) {
  const lessonRows = runQuery(
    `SELECT slug, title, main_image AS mainImage, image_alt AS imageAlt, breadcrumb_json AS breadcrumbJson FROM lessons WHERE slug = ${escapeSqlValue(slug)};`
  );

  if (!lessonRows.length) {
    return null;
  }

  const lessonRow = lessonRows[0];
  let breadcrumb = [];
  if (lessonRow.breadcrumbJson) {
    try {
      breadcrumb = JSON.parse(lessonRow.breadcrumbJson);
    } catch (error) {
      console.warn('Failed to parse breadcrumb JSON for lesson %s', slug, error);
    }
  }

  const taskRows = runQuery(
    `SELECT id, title, game FROM lesson_tasks WHERE lesson_slug = ${escapeSqlValue(slug)} ORDER BY position;`
  );

  const taskIds = taskRows.map((task) => Number(task.id)).filter((id) => !Number.isNaN(id));
  const linesMap = new Map();
  const audioMap = new Map();

  if (taskIds.length) {
    const idsList = taskIds.join(',');
    runQuery(
      `SELECT task_id AS taskId, content FROM lesson_task_lines WHERE task_id IN (${idsList}) ORDER BY task_id, position;`
    ).forEach((row) => {
      const taskId = Number(row.taskId);
      if (!linesMap.has(taskId)) {
        linesMap.set(taskId, []);
      }
      if (row.content !== null && row.content !== undefined) {
        linesMap.get(taskId).push(row.content);
      }
    });

    runQuery(
      `SELECT task_id AS taskId, src FROM lesson_task_audios WHERE task_id IN (${idsList}) ORDER BY task_id, position;`
    ).forEach((row) => {
      const taskId = Number(row.taskId);
      if (!audioMap.has(taskId)) {
        audioMap.set(taskId, []);
      }
      if (row.src) {
        audioMap.get(taskId).push(row.src);
      }
    });
  }

  const tasks = taskRows.map((task) => {
    const taskId = Number(task.id);
    const lines = linesMap.get(taskId) || [];
    const audios = audioMap.get(taskId) || [];
    const formattedTask = {
      title: task.title ?? undefined,
      lines,
    };

    if (task.game) {
      formattedTask.game = task.game;
    }

    if (audios.length === 1) {
      [formattedTask.audio] = audios;
    } else if (audios.length > 1) {
      formattedTask.audios = audios;
    }

    return formattedTask;
  });

  return {
    slug: lessonRow.slug,
    title: lessonRow.title ?? undefined,
    breadcrumb,
    mainImage: lessonRow.mainImage ?? undefined,
    imageAlt: lessonRow.imageAlt ?? undefined,
    tasks,
  };
}
