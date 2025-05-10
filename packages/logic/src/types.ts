export type Combination =
  | 'brelan'
  | 'full'
  | 'carre'
  | 'yam'
  | 'suite'
  | 'sum<=8'
  | 'sec'
  | 'defi';

export interface Player {
  id: 'player1' | 'player2';
  pawns: number; // pions restants
  board: Record<Combination, boolean>; // cases occupées
  score: number; // points gagnés avec les alignements
  occupied: Record<string, boolean>; // positions des pions sur la grille (format "x:y")
}

export interface GameContext {
  players: Player[];
  currentPlayerIndex: number;
  dice: number[];     // valeurs du dernier lancer
  keptDice: number[]; // dés mis de côté
  rollsLeft: number;  // lancers restants (max 3)
  diceCount: number;  // nb de dés en jeu (paramétrable)
}

export type GameEvent =
  | { type: 'START_GAME'; diceCount?: number }
  | { type: 'ROLL' }
  | { type: 'KEEP'; diceIndexes: number[] }
  | { type: 'CHOOSE_COMBINATION'; combination: Combination }
  | { type: 'ACCEPT_COMBINATION'; cell: { x: number; y: number } }
  | { type: 'USE_YAM_PREDATOR'; cell: { x: number; y: number } };

export const defaultBoard: Record<Combination, boolean> = {
  brelan: false,
  full: false,
  carre: false,
  yam: false,
  suite: false,
  'sum<=8': false,
  sec: false,
  defi: false,
};
