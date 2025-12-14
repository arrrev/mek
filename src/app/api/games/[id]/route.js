import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// GET single game
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await pool.query(
      `
      SELECT 
        g.id,
        g.game_date,
        g.created_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', p.id, 'name', p.name)
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as participants,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ga.id,
              'player_id', ga.player_id,
              'action_type', ga.action_type,
              'player_name', p2.name
            )
          ) FILTER (WHERE ga.id IS NOT NULL),
          '[]'
        ) as actions
      FROM games g
      LEFT JOIN game_participants gp ON g.id = gp.game_id
      LEFT JOIN players p ON gp.player_id = p.id
      LEFT JOIN game_actions ga ON g.id = ga.game_id
      LEFT JOIN players p2 ON ga.player_id = p2.id
      WHERE g.id = $1
      GROUP BY g.id, g.game_date, g.created_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// PUT update game
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { gameDate, participants, actions } = await request.json();

    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { error: 'At least one participant is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update game date
      await client.query(
        'UPDATE games SET game_date = $1 WHERE id = $2',
        [gameDate, id]
      );

      // Delete existing participants and actions
      await client.query('DELETE FROM game_participants WHERE game_id = $1', [id]);
      await client.query('DELETE FROM game_actions WHERE game_id = $1', [id]);

      // Insert new participants
      for (const playerId of participants) {
        await client.query(
          'INSERT INTO game_participants (game_id, player_id) VALUES ($1, $2)',
          [id, playerId]
        );
      }

      // Insert new actions
      if (actions && actions.length > 0) {
        for (const action of actions) {
          await client.query(
            'INSERT INTO game_actions (game_id, player_id, action_type) VALUES ($1, $2, $3)',
            [id, action.playerId, action.actionType]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch updated game
      const result = await client.query(
        `
        SELECT 
          g.id,
          g.game_date,
          g.created_at,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', p.id, 'name', p.name)
            ) FILTER (WHERE p.id IS NOT NULL),
            '[]'
          ) as participants,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', ga.id,
                'player_id', ga.player_id,
                'action_type', ga.action_type,
                'player_name', p2.name
              )
            ) FILTER (WHERE ga.id IS NOT NULL),
            '[]'
          ) as actions
        FROM games g
        LEFT JOIN game_participants gp ON g.id = gp.game_id
        LEFT JOIN players p ON gp.player_id = p.id
        LEFT JOIN game_actions ga ON g.id = ga.game_id
        LEFT JOIN players p2 ON ga.player_id = p2.id
        WHERE g.id = $1
        GROUP BY g.id, g.game_date, g.created_at
        `,
        [id]
      );

      return NextResponse.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}

// DELETE game
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await pool.query('DELETE FROM games WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}
