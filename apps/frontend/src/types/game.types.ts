export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface GameState {
    currentPlayer: number;
    dice: DiceValue[];
    remainingRolls: number;
    selectedDice: boolean[];
    scores: PlayerScores[];
}

export interface PlayerScores {
    playerId: number;
    points: number;
    tokens: number;
}

export type Combination =
    | 'brelan'
    | 'full'
    | 'carre'
    | 'yam'
    | 'suite'
    | 'somme8'
    | 'sec'
    | 'defi';