-- Complete database setup for Neon
-- Run this in Neon SQL Editor after connecting

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  color VARCHAR(20) DEFAULT '#FF6B35',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  game_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game participants (many-to-many relationship)
CREATE TABLE IF NOT EXISTS game_participants (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE(game_id, player_id)
);

-- Game actions table
CREATE TABLE IF NOT EXISTS game_actions (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (action_type IN ('first_dead', 'first_exploded', 'barking_diffuse', 'barking_dead', 'second_place', 'win'))
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_game_participants_game ON game_participants(game_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_player ON game_participants(player_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_game ON game_actions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_player ON game_actions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_type ON game_actions(action_type);

-- Seed initial players
INSERT INTO players (name, color) VALUES
  ('Arev', '#FF6B35'),
  ('Ani', '#FF6B35'),
  ('Artash', '#FF6B35'),
  ('Seroj', '#FF6B35'),
  ('Khcho', '#FF6B35'),
  ('Serine', '#FF6B35'),
  ('Davo', '#FF6B35')
ON CONFLICT (name) DO NOTHING;

