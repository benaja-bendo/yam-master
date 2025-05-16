export type Combination =
  | 'brelan'
  | 'full'
  | 'carre'
  | 'yam'
  | 'suite'
  | 'sum<=8'
  | 'sec'
  | 'defi';

export type Player = {
  id: 'player1' | 'player2';
  pawns: number; // pions restants
  board: Record<Combination, boolean>; // cases occupées
  score: number; // points gagnés avec les alignements
  occupied: Record<string, boolean>; // positions des pions sur la grille (format "x:y")
};

export type Cell = { x: number; y: number };
export type Board = Record<string, boolean>; // format "x:y" => true si la case est occupée

// Mode de jeu
export type GameMode = 'pvp' | 'pvb';
export type BotDifficulty = 'easy' | 'hard';

// État du jeu
export type GameState =
  | { value: 'idle' }
  | { value: 'rolling'; dice: number[] }
  | { value: 'choosing'; keptDice: number[]; dice: number[] }
  | { value: 'checking'; keptDice: number[]; dice: number[] }
  | { value: 'playing'; checkEnd: 'gameOver' | 'nextPlayer' | 'nextTurn' };

export type GameContext = {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  players: Player[];
  currentPlayerIndex: number;
  dice: number[];     // valeurs du dernier lancer
  keptDice: number[]; // dés mis de côté
  rollsLeft: number;  // lancers restants (max 3)
  diceCount: number;  // nb de dés en jeu (paramétrable)
};

export type GameEvent =
  | { type: 'START_GAME'; mode: GameMode; botDifficulty?: BotDifficulty; diceCount?: number }
  | { type: 'JOIN'; playerId: 'player2' }
  | { type: 'ROLL' }
  | { type: 'KEEP'; diceIndexes: number[] }
  | { type: 'CHOOSE_COMBINATION'; combination: Combination; cell: Cell }
  | { type: 'ACCEPT_COMBINATION'; cell: Cell }
  | { type: 'USE_YAM_PREDATOR'; cell: Cell };

export type GameAction =
  | { type: 'START_GAME'; diceCount?: number }
  | { type: 'ROLL'; dice: number[] }
  | { type: 'KEEP'; keptDice: number[] }
  | { type: 'CHOOSE_COMBINATION'; combination: Combination; cell: Cell };
