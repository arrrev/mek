import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// PUT update player
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, color } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'UPDATE players SET name = $1, color = $2 WHERE id = $3 RETURNING id, name, color, created_at',
      [name.trim(), color || '#FF6B35', id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating player:', error);
    
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Player with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to update player: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
