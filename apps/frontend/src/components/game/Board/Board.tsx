import React from 'react';
import styled from 'styled-components';

interface BoardProps {
  grid: Array<Array<{
    player?: 'player1' | 'player2';
    combination?: string;
  }>>;
  onCellClick: (x: number, y: number) => void;
  currentPlayer: 'player1' | 'player2';
}

// Définition des composants styled en dehors du composant fonctionnel
const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const Cell = styled.button<{ player?: string }>`
  aspect-ratio: 1;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: ${({ player }) =>
    player === 'player1'
      ? '#4CAF50'
      : player === 'player2'
      ? '#2196F3'
      : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

export const Board: React.FC<BoardProps> = ({ grid, onCellClick, currentPlayer }) => {
  return (
    <BoardGrid>
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <Cell
            key={`${x}-${y}`}
            player={cell.player}
            onClick={() => onCellClick(x, y)}
            title={cell.combination || ''}
          />
        ))
      )}
    </BoardGrid>
  );
};