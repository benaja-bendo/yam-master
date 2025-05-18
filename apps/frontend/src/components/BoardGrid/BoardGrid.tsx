import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Cell {
  id: string;
  content: React.ReactNode;
  isHeader?: boolean;
  isHighlighted?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
}

interface BoardGridProps {
  cells: Cell[][];
  className?: string;
}

export const BoardGrid: React.FC<BoardGridProps> = ({ cells, className }) => {
  return (
    <div className={twMerge('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
        <tbody>
          {cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell) => (
                <td
                  key={cell.id}
                  onClick={cell.isSelectable ? cell.onClick : undefined}
                  className={twMerge(
                    'p-3 border border-gray-200',
                    cell.isHeader && 'bg-gray-50 font-medium',
                    cell.isHighlighted && 'bg-blue-50',
                    cell.isSelectable && 'cursor-pointer hover:bg-blue-50 transition-colors duration-200',
                    !cell.isSelectable && !cell.isHeader && 'bg-white'
                  )}
                  role={cell.isSelectable ? 'button' : undefined}
                  tabIndex={cell.isSelectable ? 0 : undefined}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};