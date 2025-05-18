import React, { useState } from 'react';
import type { Cell } from '@yamaster/logic';
import { DiceRoll } from './game/DiceRoll/DiceRoll';
import { Board } from './game/Board/Board';
import { Combinations } from './game/Combinations/Combinations';
import styled from 'styled-components';

interface Props {
  state: any;
  send: (event: object) => void;
}

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

const GameArea = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const GameBoard: React.FC<Props> = ({ state, send }) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  if (!state) return <div>Chargement…</div>;

  const { dice, keptDice, rollsLeft, context, value } = state;

  const handleRoll = () => send({ type: 'ROLL' });
  const handleKeep = (idx: number) => send({ type: 'KEEP', diceIndexes: [idx] });
  
  const handleCellClick = (x: number, y: number) => {
    setSelectedCell({ x, y });
  };

  const handleChoose = (combo: string) => {
    if (!selectedCell) return;
    send({ type: 'CHOOSE_COMBINATION', combination: combo, cell: selectedCell });
    send({ type: 'ACCEPT_COMBINATION', cell: selectedCell });
    setSelectedCell(null);
  };

  const grid = Array(5).fill(null).map(() =>
    Array(5).fill(null).map(() => ({ player: undefined, combination: undefined }))
  );

  // Remplir la grille avec les données des joueurs depuis le contexte
  if (context.players) {
    Object.entries(context.players).forEach(([playerId, playerData]: [string, any]) => {
      playerData.cells?.forEach((cell: Cell & { combination: string }) => {
        grid[cell.y][cell.x] = {
          player: playerId,
          combination: cell.combination
        };
      });
    });
  }

  const availableCombinations = state.context.dice
    ? (window as any).evaluateCombinations(state.context.dice)
    : [];

  return (
    <GameContainer>
      <GameArea>
        <div>
          <DiceRoll
            dice={dice}
            keptDice={keptDice}
            rollsLeft={rollsLeft}
            onRoll={handleRoll}
            onKeep={handleKeep}
          />
          <Combinations
            availableCombinations={availableCombinations}
            onChoose={handleChoose}
          />
        </div>
        <Board
          grid={grid}
          onCellClick={handleCellClick}
          currentPlayer={context.currentPlayer || 'player1'}
        />
      </GameArea>
    </GameContainer>
  );
};
