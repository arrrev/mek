import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// GET all players
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at FROM players ORDER BY name ASC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// POST create new player
export async function POST(request) {
  try {
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO players (name) VALUES ($1) RETURNING id, name, created_at',
      [name.trim()]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Player with this name already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
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
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}
