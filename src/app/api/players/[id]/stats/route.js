import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { calculatePlayerPoints, ACTION_POINTS } from '@/lib/scoring';

// GET player statistics
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to current month if no dates provided
    // Use local timezone to avoid day shifts
    const formatDateLocal = (y, m, d) => {
      const year = y;
      const month = String(m + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    let start, end;
    if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      start = formatDateLocal(year, month, 1);
      end = formatDateLocal(year, month + 1, 1);
    }

    // Get player info
    const playerResult = await pool.query(
      'SELECT id, name FROM players WHERE id = $1',
      [id]
    );

    if (playerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const player = playerResult.rows[0];

    // Get total games in period
    // Start date is inclusive (>=), end date is exclusive (<)
    const totalGamesResult = await pool.query(
      'SELECT COUNT(*) as count FROM games WHERE game_date >= $1 AND game_date < $2',
      [start, end]
    );
    const totalGames = parseInt(totalGamesResult.rows[0].count);

    // Get games played by player
    const gamesPlayedResult = await pool.query(
      `
      SELECT COUNT(DISTINCT gp.game_id) as games_played
      FROM game_participants gp
      INNER JOIN games g ON gp.game_id = g.id
      WHERE gp.player_id = $1 AND g.game_date >= $2 AND g.game_date < $3
      `,
      [id, start, end]
    );
    const gamesPlayed = parseInt(gamesPlayedResult.rows[0]?.games_played || 0);

    // Get all actions for player
    const actionsResult = await pool.query(
      `
      SELECT 
        ga.action_type,
        COUNT(*) as count
      FROM game_actions ga
      INNER JOIN games g ON ga.game_id = g.id
      WHERE ga.player_id = $1 AND g.game_date >= $2 AND g.game_date < $3
      GROUP BY ga.action_type
      `,
      [id, start, end]
    );

    // Get game-by-game breakdown
    const gameBreakdownResult = await pool.query(
      `
      SELECT 
        g.id,
        g.game_date,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'action_type', ga.action_type,
              'points', CASE 
                WHEN ga.action_type = 'first_dead' THEN -5
                WHEN ga.action_type = 'first_exploded' THEN -1
                WHEN ga.action_type = 'barking_diffuse' THEN -1
                WHEN ga.action_type = 'barking_dead' THEN -3
                WHEN ga.action_type = 'second_place' THEN 5
                WHEN ga.action_type = 'win' THEN 10
                ELSE 0
              END
            )
          ) FILTER (WHERE ga.id IS NOT NULL),
          '[]'
        ) as actions
      FROM games g
      INNER JOIN game_participants gp ON g.id = gp.game_id
      LEFT JOIN game_actions ga ON g.id = ga.game_id AND ga.player_id = $1
      WHERE gp.player_id = $1 AND g.game_date >= $2 AND g.game_date < $3
      GROUP BY g.id, g.game_date
      ORDER BY g.game_date DESC
      `,
      [id, start, end]
    );

    // Build stats
    const stats = {
      first_dead: 0,
      first_exploded: 0,
      barking_diffuse: 0,
      barking_dead: 0,
      second_place: 0,
      win: 0,
    };

    actionsResult.rows.forEach((action) => {
      if (stats.hasOwnProperty(action.action_type)) {
        stats[action.action_type] = parseInt(action.count);
      }
    });

    // Calculate total points
    const actions = actionsResult.rows.flatMap((a) =>
      Array(parseInt(a.count)).fill({ action_type: a.action_type })
    );
    const totalPoints = calculatePlayerPoints(actions, totalGames, gamesPlayed);

    return NextResponse.json({
      player,
      period: { startDate: start, endDate: end },
      totalGames,
      gamesPlayed,
      absenceRate: totalGames > 0 ? ((totalGames - gamesPlayed) / totalGames) * 100 : 0,
      totalPoints,
      stats,
      gameBreakdown: gameBreakdownResult.rows,
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics' },
      { status: 500 }
    );
  }
}
