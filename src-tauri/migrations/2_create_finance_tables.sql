CREATE TABLE IF NOT EXISTS fixed_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount TEXT NOT NULL, -- Decimal
  period TEXT DEFAULT 'Monthly', -- Monthly, Yearly
  is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS variable_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rate TEXT NOT NULL, -- Decimal
  type TEXT DEFAULT 'PercentOfSales', -- PercentOfSales, FixedAmount
  is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS income_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, -- YYYY-MM-DD
  amount TEXT NOT NULL, -- Decimal
  description TEXT,
  source TEXT DEFAULT 'Sales'
);
