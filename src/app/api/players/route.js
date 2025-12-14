import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// GET all players
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, name, color, created_at FROM players ORDER BY name ASC'
    );
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching players:', error);
    // Return empty array instead of error object to prevent frontend issues
    if (error.code === '42P01') { // Table doesn't exist
      console.error('Players table does not exist. Please run the database schema.');
      return NextResponse.json([]);
    }
    return NextResponse.json([]);
  }
}

// POST create new player
export async function POST(request) {
  try {
    const { name, color } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO players (name, color) VALUES ($1, $2) RETURNING id, name, color, created_at',
      [name.trim(), color || '#FF6B35']
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Player with this name already exists' },
        { status: 409 }
      );
    }
    
    if (error.code === '42P01') { // Table doesn't exist
      return NextResponse.json(
        { error: 'Database table does not exist. Please run the database schema first.' },
        { status: 500 }
      );
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('connection')) {
      return NextResponse.json(
        { error: 'Cannot connect to database. Please check your DATABASE_URL environment variable. For Vercel: Settings > Environment Variables. For local: .env.local' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to create player: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE player
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM players WHERE id = $1', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    
    if (error.code === '42P01') { // Table doesn't exist
      return NextResponse.json(
        { error: 'Database table does not exist. Please run the database schema first.' },
        { status: 500 }
      );
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('connection')) {
      return NextResponse.json(
        { error: 'Cannot connect to database. Please check your DATABASE_URL environment variable. For Vercel: Settings > Environment Variables. For local: .env.local' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to delete player: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
