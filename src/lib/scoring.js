// Scoring logic for Exploding Kittens game

export const ACTION_POINTS = {
  first_dead: -1,
  first_exploded: -3,
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

  // Calculate absence penalty
  if (totalGames > playerGames && playerGames > 0) {
    const absenceRate = (totalGames - playerGames) / totalGames;
    totalPoints = totalPoints * (1 - absenceRate);
  }

  return Math.round(totalPoints * 100) / 100; // Round to 2 decimal places
}
