import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const dbPath = path.join(dataDir, 'magic_academy.db');

export function escapeSqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  const stringified = String(value).replace(/'/g, "''");
  return `'${stringified}'`;
}

export function runStatement(sql) {
  execFileSync('sqlite3', [dbPath, sql]);
}

export function runQuery(sql) {
  const output = execFileSync('sqlite3', ['-json', dbPath, sql], {
    encoding: 'utf-8',
  }).trim();

  if (!output) {
    return [];
  }

  try {
    return JSON.parse(output);
  } catch (error) {
    console.error('Failed to parse SQLite JSON output:', output);
    throw error;
  }
}
