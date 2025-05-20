import { useState, useCallback } from 'react';
import { evaluateCombinations } from '@yamaster/logic';
import type { Cell } from '@yamaster/logic';

export interface GameLogicState {
  selectedDice: number[];
  selectedCell: Cell | null;
  availableCombinations: string[];
  suggestedCombinations: string[];
}

export const useGameLogic = (context: any) => {
  const [state, setState] = useState<GameLogicState>({
    selectedDice: [],
    selectedCell: null,
    availableCombinations: [],
    suggestedCombinations: []
  });

  // Mettre à jour les combinaisons disponibles en fonction des dés
  const updateCombinations = useCallback(() => {
    if (!context || !context.dice) return;
    
    const availableCombos = evaluateCombinations(context.dice);
    setState(prev => ({
      ...prev,
      availableCombinations: availableCombos,
      // Suggérer les meilleures combinaisons (par exemple, les 3 premières)
      suggestedCombinations: availableCombos.slice(0, 3)
    }));
  }, [context]);

  // Sélectionner un dé
  const selectDie = useCallback((dieIndex: number) => {
    setState(prev => {
      const isSelected = prev.selectedDice.includes(dieIndex);
      return {
        ...prev,
        selectedDice: isSelected
          ? prev.selectedDice.filter(idx => idx !== dieIndex)
          : [...prev.selectedDice, dieIndex]
      };
    });
  }, []);

  // Sélectionner une cellule sur la grille
  const selectCell = useCallback((x: number, y: number) => {
    setState(prev => ({
      ...prev,
      selectedCell: { x, y }
    }));
  }, []);

  // Choisir une combinaison
  const chooseCombination = useCallback((combination: string, send: (event: object) => void) => {
    if (!state.selectedCell) return;
    
    send({
      type: "CHOOSE_COMBINATION",
      combination,
      cell: state.selectedCell
    });
    
    // Réinitialiser la sélection après avoir choisi
    setState(prev => ({
      ...prev,
      selectedDice: [],
      selectedCell: null
    }));
  }, [state.selectedCell]);

  // Lancer les dés
  const rollDice = useCallback((send: (event: object) => void) => {
    send({ type: "ROLL" });
    setState(prev => ({
      ...prev,
      selectedDice: []
    }));
  }, []);

  // Garder des dés spécifiques
  const keepDice = useCallback((diceIndexes: number[], send: (event: object) => void) => {
    send({ type: "KEEP", diceIndexes });
    setState(prev => ({
      ...prev,
      selectedDice: []
    }));
  }, []);

  return {
    ...state,
    selectDie,
    selectCell,
    chooseCombination,
    rollDice,
    keepDice,
    updateCombinations
  };
};