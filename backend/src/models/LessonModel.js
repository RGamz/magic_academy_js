import fs from 'fs';
import path from 'path';

export function getLessonById(id) {
  const filePath = path.resolve('backend/assets/lessons', `${id}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
