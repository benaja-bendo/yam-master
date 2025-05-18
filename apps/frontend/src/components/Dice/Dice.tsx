import React from 'react';
import { twMerge } from 'tailwind-merge';

interface DiceProps {
  value: number;
  isSelected?: boolean;
  isRolling?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isSelected = false,
  isRolling = false,
  onClick,
  size = 'md',
  disabled = false
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };

  const baseStyles = 'rounded-lg shadow-md flex items-center justify-center cursor-pointer transition-all duration-200';
  const stateStyles = twMerge(
    'bg-white border-2',
    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300',
    isRolling ? 'animate-bounce' : ''
  );

  const getDiceDots = (value: number) => {
    const dots = [];
    for (let i = 0; i < value; i++) {
      dots.push(
        <div
          key={i}
          className="w-1.5 h-1.5 bg-gray-800 rounded-full"
        />
      );
    }
    return dots;
  };

  const dicePatterns = {
    1: 'grid place-items-center',
    2: 'grid grid-cols-2 gap-2 p-2',
    3: 'grid grid-cols-2 gap-2 p-2 [&>*:last-child]:col-span-2 [&>*:last-child]:justify-self-center',
    4: 'grid grid-cols-2 gap-2 p-2',
    5: 'grid grid-cols-2 gap-2 p-2 [&>*:nth-child(3)]:col-span-2 [&>*:nth-child(3)]:justify-self-center',
    6: 'grid grid-cols-2 gap-2 p-2'
  };

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={twMerge(
        baseStyles,
        stateStyles,
        sizes[size],
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Dé avec la valeur ${value}`}
    >
      <div className={dicePatterns[value as keyof typeof dicePatterns]}>
        {getDiceDots(value)}
      </div>
    </div>
  );
};