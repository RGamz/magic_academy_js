// backend/src/db/migrate.js
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// --- Path helpers (for ESM) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Paths ---
const dbPath = process.env.DB_FILE || './data/magic_academy.sqlite';
const migDir = path.join(__dirname, 'migrations');

// --- Ensure directory exists ---
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// --- Connect to DB ---
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// --- Create migrations tracking table ---
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY,
    filename TEXT UNIQUE NOT NULL,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// --- Get already applied migrations ---
const applied = new Set(
  db.prepare('SELECT filename FROM _migrations').all().map(r => r.filename)
);

// --- Load SQL files ---
const files = fs.readdirSync(migDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

// --- Apply migrations inside a transaction ---
db.transaction(() => {
  for (const file of files) {
    if (applied.has(file)) continue;

    const fullPath = path.join(migDir, file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    console.log(`Applying ${file}...`);

    db.exec(sql);
    db.prepare('INSERT INTO _migrations (filename) VALUES (?)').run(file);
  }
})();

console.log('✅ All migrations complete.');
db.close();

