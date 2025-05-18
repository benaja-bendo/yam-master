// components/game/GameBoard/GameBoard.tsx
import type {DiceValue} from "../../../types/game.types.ts";

interface GameBoardProps {
    board: (number | null)[][];
    onCellClick: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick }) => {
    // Rendu du plateau de jeu
};

// components/game/DiceArea/DiceArea.tsx
interface DiceAreaProps {
    dice: DiceValue[];
    selectedDice: boolean[];
    onDiceClick: (index: number) => void;
    onRollDice: () => void;
    remainingRolls: number;
}

export const DiceArea: React.FC<DiceAreaProps> = ({...}) => {
    // Rendu de la zone des dés
};