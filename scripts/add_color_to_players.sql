-- Add color column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#FF6B35';
