import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// GET all games with participants and actions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = `
      SELECT 
        g.id,
        g.game_date,
        g.created_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', p.id,
              'name', p.name
            )
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
    `;

    const params = [];
    if (startDate && endDate) {
      query += ` WHERE g.game_date BETWEEN $1 AND $2`;
      params.push(startDate, endDate);
    }

    query += ` GROUP BY g.id, g.game_date, g.created_at ORDER BY g.game_date DESC, g.created_at DESC`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// POST create new game
export async function POST(request) {
  try {
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

      // Insert game
      const gameResult = await client.query(
        'INSERT INTO games (game_date) VALUES ($1) RETURNING id, game_date',
        [gameDate || new Date().toISOString().split('T')[0]]
      );
      const gameId = gameResult.rows[0].id;

      // Insert participants
      for (const playerId of participants) {
        await client.query(
          'INSERT INTO game_participants (game_id, player_id) VALUES ($1, $2)',
          [gameId, playerId]
        );
      }

      // Insert actions
      if (actions && actions.length > 0) {
        for (const action of actions) {
          await client.query(
            'INSERT INTO game_actions (game_id, player_id, action_type) VALUES ($1, $2, $3)',
            [gameId, action.playerId, action.actionType]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch complete game data
      const completeGame = await client.query(
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
        [gameId]
      );

      return NextResponse.json(completeGame.rows[0], { status: 201 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
