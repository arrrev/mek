// Scoring logic for Exploding Kittens game

export const ACTION_POINTS = {
  first_dead: -5,
  first_exploded: -1,
  barking_diffuse: -1,
  barking_dead: -3,
  second_place: 5,
  win: 10,
};

/**
 * Calculate total points for a player in a given period
 * @param {Array} actions - Array of game actions
 * @param {number} totalGames - Total number of games in the period
 * @param {number} playerGames - Number of games the player participated in
 * @returns {number} Total points with absence penalty applied
 */
export function calculatePlayerPoints(actions, totalGames, playerGames) {
  // Calculate base points from actions
  let totalPoints = actions.reduce((sum, action) => {
    return sum + (ACTION_POINTS[action.action_type] || 0);
  }, 0);

  // Apply participation penalty: multiply by (games played / total games)
  // Example: If 20 total games and player played 18, multiply by 18/20 = 0.9
  if (totalGames > 0 && playerGames >= 0) {
    if (playerGames === 0) {
      // Player didn't play any games, points should be 0
      totalPoints = 0;
    } else if (playerGames < totalGames) {
      // Player missed some games, apply penalty
      const participationRate = playerGames / totalGames;
      totalPoints = totalPoints * participationRate;
    }
    // If playerGames === totalGames, no penalty needed (participationRate = 1.0)
  }

  return Math.round(totalPoints * 100) / 100; // Round to 2 decimal places
}
