import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set!');
  console.error('For Vercel: Go to Project Settings > Environment Variables and add DATABASE_URL');
  console.error('For local: Create .env.local file with DATABASE_URL=your_connection_string');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
