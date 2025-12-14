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

    // Get total games in period
    // Start date is inclusive (>=), end date is exclusive (<)
    const totalGamesResult = await pool.query(
      'SELECT COUNT(*) as count FROM games WHERE game_date >= $1 AND game_date < $2',
      [start, end]
    );
    const totalGames = parseInt(totalGamesResult.rows[0].count);

    // Get all players
    const playersResult = await pool.query('SELECT id, name, color FROM players ORDER BY name');
    const players = playersResult.rows;

    // Get all actions for each player in the period
    // Only count actions from games where the player was a participant
    const actionsResult = await pool.query(
      `
      SELECT 
        ga.player_id,
        ga.action_type,
        COUNT(*) as count
      FROM game_actions ga
      INNER JOIN games g ON ga.game_id = g.id
      INNER JOIN game_participants gp ON ga.game_id = gp.game_id AND ga.player_id = gp.player_id
      WHERE g.game_date >= $1 AND g.game_date < $2
      GROUP BY ga.player_id, ga.action_type
      `,
      [start, end]
    );

    // Get games played by each player (must be in game_participants)
    const gamesPlayedResult = await pool.query(
      `
      SELECT 
        gp.player_id,
        COUNT(DISTINCT gp.game_id) as games_played
      FROM game_participants gp
      INNER JOIN games g ON gp.game_id = g.id
      WHERE g.game_date >= $1 AND g.game_date < $2
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

      // Calculate points with participation penalty
      // Formula: basePoints * (gamesPlayed / totalGames)
      // Example: If 20 total games and player played 18, multiply by 18/20 = 0.9
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
        color: player.color || '#FF6B35',
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
    // Return empty structure instead of error to prevent frontend crashes
    const formatDateLocal = (y, m, d) => {
      const year = y;
      const month = String(m + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = formatDateLocal(year, month, 1);
    const end = formatDateLocal(year, month + 1, 1);
    
    return NextResponse.json({
      period: { startDate: start, endDate: end },
      totalGames: 0,
      leaderboard: [],
    });
  }
}
