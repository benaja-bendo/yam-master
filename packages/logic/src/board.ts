import { Player } from './types';

type Cell = { x: number; y: number };
type Board = Record<string, boolean>;

/**
 * Vérifie si une cellule fait partie d'un alignement et retourne les points gagnés
 * @returns 999 pour un alignement de 5, sinon le nombre de points (1 pour 3 pions, 2 pour 4 pions)
 */
export function checkAlignment(board: Board, cell: Cell): number {
  const directions = [
    { dx: 1, dy: 0 },  // horizontal
    { dx: 0, dy: 1 },  // vertical
    { dx: 1, dy: 1 },  // diagonale \
    { dx: 1, dy: -1 }, // diagonale /
  ];

  let maxLength = 0;

  for (const dir of directions) {
    let count = 1; // compte la cellule courante

    // Compte dans une direction
    for (let i = 1; i <= 4; i++) {
      const key = `${cell.x + dir.dx * i}:${cell.y + dir.dy * i}`;
      if (!board[key]) break;
      count++;
    }

    // Compte dans la direction opposée
    for (let i = 1; i <= 4; i++) {
      const key = `${cell.x - dir.dx * i}:${cell.y - dir.dy * i}`;
      if (!board[key]) break;
      count++;
    }

    maxLength = Math.max(maxLength, count);
  }

  if (maxLength >= 5) return 999; // Victoire immédiate
  if (maxLength === 4) return 2;
  if (maxLength === 3) return 1;
  return 0;
}

/**
 * Applique le Yam Predator : retire un pion adverse
 */
export function applyYamPredator(players: Player[], currentPlayerIndex: number, cell: Cell): Player[] {
  const opponent = players[1 - currentPlayerIndex];
  const key = `${cell.x}:${cell.y}`;

  if (opponent.occupied[key]) {
    opponent.occupied[key] = false;
    opponent.pawns++;
  }

  return [...players];
}