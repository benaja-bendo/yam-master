import { useState, useCallback } from 'react';

type GameState = Record<string, number | null>;

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    'As': null,
    'Deux': null,
    'Trois': null,
    'Quatre': null,
    'Cinq': null,
    'Six': null,
    'Brelan': null,
    'Carré': null,
    'Full': null,
    'Petite suite': null,
    'Grande suite': null,
    'Yam': null,
    'Chance': null
  });

  const updateScore = useCallback((combination: string, score: number) => {
    setGameState(prev => ({
      ...prev,
      [combination]: score
    }));
  }, []);

  const calculateTotal = useCallback((diceValues: number[], combination: string): number => {
    const sortedValues = [...diceValues].sort((a, b) => a - b);
    const valueCounts = diceValues.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    switch (combination) {
      case 'As':
      case 'Deux':
      case 'Trois':
      case 'Quatre':
      case 'Cinq':
      case 'Six': {
        const number = ['As', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six'].indexOf(combination) + 1;
        return diceValues.filter(v => v === number).reduce((sum, v) => sum + v, 0);
      }
      case 'Brelan': {
        const hasBrelan = Object.values(valueCounts).some(count => count >= 3);
        return hasBrelan ? diceValues.reduce((sum, v) => sum + v, 0) : 0;
      }
      case 'Carré': {
        const hasCarre = Object.values(valueCounts).some(count => count >= 4);
        return hasCarre ? diceValues.reduce((sum, v) => sum + v, 0) : 0;
      }
      case 'Full': {
        const counts = Object.values(valueCounts);
        const hasFull = counts.includes(2) && counts.includes(3);
        return hasFull ? 25 : 0;
      }
      case 'Petite suite': {
        const uniqueValues = Array.from(new Set(sortedValues)).join('');
        return uniqueValues.includes('1234') || uniqueValues.includes('2345') || uniqueValues.includes('3456') ? 30 : 0;
      }
      case 'Grande suite': {
        const uniqueValues = Array.from(new Set(sortedValues)).join('');
        return uniqueValues === '12345' || uniqueValues === '23456' ? 40 : 0;
      }
      case 'Yam': {
        return Object.values(valueCounts).some(count => count === 5) ? 50 : 0;
      }
      case 'Chance': {
        return diceValues.reduce((sum, v) => sum + v, 0);
      }
      default:
        return 0;
    }
  }, []);

  return {
    gameState,
    updateScore,
    calculateTotal
  };
};