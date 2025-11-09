-- Add fields needed for lesson preview cards on home page

-- Add slug column (identifier like "lesson_1")
ALTER TABLE lessons ADD COLUMN slug TEXT;

-- Add description_id for preview description
ALTER TABLE lessons ADD COLUMN description_id INTEGER REFERENCES text_translations(id);

-- Add tag column for lesson difficulty/category (e.g., "Débutant")
ALTER TABLE lessons ADD COLUMN tag TEXT;

-- Create index for slug for fast lookups
CREATE INDEX idx_lessons_slug ON lessons(slug);
