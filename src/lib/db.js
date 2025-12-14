import { Pool } from 'pg';

// Support both DATABASE_URL and db_DATABASE_URL (Vercel Neon integration)
const databaseUrl = process.env.DATABASE_URL || process.env.db_DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL or db_DATABASE_URL environment variable is not set!');
  console.error('For Vercel: Check Environment Variables in project settings');
  console.error('For local: Create .env.local file with DATABASE_URL=your_connection_string');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl?.includes('neon.tech') || databaseUrl?.includes('neon') ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
