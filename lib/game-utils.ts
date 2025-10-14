/**
 * Utility functions for game-related checks
 */

interface GameWithPayment {
  costPerSession?: number;
}

/**
 * Check if a game requires payment
 */
export function isPaidGame(game: GameWithPayment | null | undefined): boolean {
  return !!(game?.costPerSession && game.costPerSession > 0);
}
