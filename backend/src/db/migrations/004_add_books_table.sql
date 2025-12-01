-- Books table for library listing
-- Page-specific content (audio, vocabulary) stored in JSON files

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  pdf_path TEXT NOT NULL,
  page_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast slug lookups
CREATE INDEX idx_books_slug ON books(slug);