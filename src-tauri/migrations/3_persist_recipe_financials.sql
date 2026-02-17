-- Add financial persistence columns to recipes
ALTER TABLE recipes ADD COLUMN labor_steps TEXT DEFAULT '[]';
ALTER TABLE recipes ADD COLUMN overheads TEXT DEFAULT '{}';
