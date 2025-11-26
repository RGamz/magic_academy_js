-- Add type column to external_links for distinguishing YouTube videos from regular links
-- Types: 'youtube', 'link' (default)

ALTER TABLE external_links ADD COLUMN type TEXT NOT NULL DEFAULT 'link';

-- Create index for faster type lookups
CREATE INDEX idx_external_links_type ON external_links(type);