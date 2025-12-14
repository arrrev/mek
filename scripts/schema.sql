-- Create database schema for Exploding Kittens game tracker

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
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
