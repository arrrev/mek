import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function deleteAllGames() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Deleting all game actions...');
    await client.query('DELETE FROM game_actions');
    
    console.log('Deleting all game participants...');
    await client.query('DELETE FROM game_participants');
    
    console.log('Deleting all games...');
    await client.query('DELETE FROM games');
    
    await client.query('COMMIT');
    
    console.log('✅ All game history data has been deleted successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error deleting game data:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

deleteAllGames();
