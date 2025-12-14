import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { calculatePlayerPoints, ACTION_POINTS } from '@/lib/scoring';

// GET analytics/leaderboard
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to current month if no dates provided
    let start, end;
    if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    // Get total games in period
    const totalGamesResult = await pool.query(
      'SELECT COUNT(*) as count FROM games WHERE game_date BETWEEN $1 AND $2',
      [start, end]
    );
    const totalGames = parseInt(totalGamesResult.rows[0].count);

    // Get all players
    const playersResult = await pool.query('SELECT id, name FROM players ORDER BY name');
    const players = playersResult.rows;

    // Get all actions for each player in the period
    const actionsResult = await pool.query(
      `
      SELECT 
        ga.player_id,
        ga.action_type,
        COUNT(*) as count
      FROM game_actions ga
      INNER JOIN games g ON ga.game_id = g.id
      WHERE g.game_date BETWEEN $1 AND $2
      GROUP BY ga.player_id, ga.action_type
      `,
      [start, end]
    );

    // Get games played by each player
    const gamesPlayedResult = await pool.query(
      `
      SELECT 
        gp.player_id,
        COUNT(DISTINCT gp.game_id) as games_played
      FROM game_participants gp
      INNER JOIN games g ON gp.game_id = g.id
      WHERE g.game_date BETWEEN $1 AND $2
      GROUP BY gp.player_id
      `,
      [start, end]
    );

    // Build player stats
    const playerStats = players.map(player => {
      const playerActions = actionsResult.rows.filter(a => a.player_id === player.id);
      const gamesPlayed = gamesPlayedResult.rows.find(g => g.player_id === player.id)?.games_played || 0;
      
      // Convert to format expected by calculatePlayerPoints
      const actions = playerActions.flatMap(a => 
        Array(parseInt(a.count)).fill({ action_type: a.action_type })
      );

      const totalPoints = calculatePlayerPoints(actions, totalGames, gamesPlayed);

      // Build detailed stats
      const stats = {
        first_dead: 0,
        first_exploded: 0,
        barking_diffuse: 0,
        barking_dead: 0,
        second_place: 0,
        win: 0,
      };

      playerActions.forEach(action => {
        if (stats.hasOwnProperty(action.action_type)) {
          stats[action.action_type] = parseInt(action.count);
        }
      });

      return {
        playerId: player.id,
        playerName: player.name,
        totalPoints,
        gamesPlayed,
        totalGames,
        absenceRate: totalGames > 0 ? ((totalGames - gamesPlayed) / totalGames) * 100 : 0,
        stats,
      };
    });

    // Sort by total points descending
    playerStats.sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json({
      period: { startDate: start, endDate: end },
      totalGames,
      leaderboard: playerStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
