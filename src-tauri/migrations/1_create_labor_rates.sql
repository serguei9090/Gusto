CREATE TABLE IF NOT EXISTS labor_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  hourly_rate TEXT NOT NULL, -- Storing Decimal strings
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT 1
);

INSERT INTO labor_rates (name, hourly_rate, currency) VALUES 
('Head Chef', '35.00', 'USD'),
('Line Cook', '20.00', 'USD'),
('Dishwasher', '15.00', 'USD'),
('Server', '12.00', 'USD');
