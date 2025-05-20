import React from 'react';
import styled from 'styled-components';
import type { Cell } from '@yamaster/logic';

interface BoardProps {
  grid: Array<Array<{
    player?: 'player1' | 'player2';
    combination?: string;
  }>>;
  onCellClick: (x: number, y: number) => void;
  currentPlayer: 'player1' | 'player2';
  selectedCell: Cell | null;
}

// Définition des composants styled en dehors du composant fonctionnel
const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  aspect-ratio: 1;
`;

const GridCell = styled.button<{ player?: string; selected?: boolean; available?: boolean }>`
  aspect-ratio: 1;
  border: 2px solid ${props => props.selected ? '#ffcc00' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  background: ${props => {
    if (props.selected) return 'rgba(255, 204, 0, 0.3)';
    if (props.player === 'player1') return 'rgba(76, 175, 80, 0.7)';
    if (props.player === 'player2') return 'rgba(33, 150, 243, 0.7)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  color: white;
  font-size: 0.8rem;
  font-weight: ${props => props.player ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    transform: ${props => !props.player ? 'scale(1.05)' : 'none'};
  }
`;

export const Board: React.FC<BoardProps> = ({ grid, onCellClick, currentPlayer, selectedCell }) => {
  return (
    <BoardGrid>
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <GridCell
            key={`${x}-${y}`}
            player={cell.player}
            selected={selectedCell?.x === x && selectedCell?.y === y}
            available={!cell.player}
            onClick={() => onCellClick(x, y)}
            title={cell.combination || ''}
          >
            {cell.combination}
          </GridCell>
        ))
      )}
    </BoardGrid>
  );
};