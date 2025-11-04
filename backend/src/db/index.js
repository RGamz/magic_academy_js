const Database = require('better-sqlite3');
require('dotenv').config();

const db = new Database(process.env.DB_FILE, { verbose: null });
// Good defaults
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

module.exports = {
  db,

  // Helper: single row
  get(sql, params = []) {
    return db.prepare(sql).get(params);
  },

  // Helper: many rows
  all(sql, params = []) {
    return db.prepare(sql).all(params);
  },

  // Helper: run (insert/update/delete)
  run(sql, params = []) {
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
    return info; // contains .changes, .lastInsertRowid
  }
};
