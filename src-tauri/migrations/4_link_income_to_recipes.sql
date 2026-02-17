-- Link income to recipes for theoretical cost analysis
ALTER TABLE income_entries ADD COLUMN recipe_id INTEGER REFERENCES recipes(id);
ALTER TABLE income_entries ADD COLUMN quantity REAL DEFAULT 1;
