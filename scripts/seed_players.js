import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const players = [
  'Arev',
  'Ani',
  'Artash',
  'Seroj',
  'Khcho',
  'Serine',
  'Davo'
];

async function seedPlayers() {
  try {
    console.log('Seeding players...');
    
    for (const name of players) {
      await pool.query(
        'INSERT INTO players (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [name]
      );
      console.log(`✓ Added player: ${name}`);
    }
    
    console.log('Players seeded successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding players:', error);
    await pool.end();
    process.exit(1);
  }
}

seedPlayers();
