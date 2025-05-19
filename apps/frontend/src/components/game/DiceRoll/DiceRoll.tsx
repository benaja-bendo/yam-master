import React from 'react';
import { Button } from '../../../App.styles';

interface DiceRollProps {
  dice: number[];
  keptDice: number[];
  rollsLeft: number;
  onRoll: () => void;
  onKeep: (index: number) => void;
}

export const DiceRoll: React.FC<DiceRollProps> = ({
  dice,
  keptDice,
  rollsLeft,
  onRoll,
  onKeep,
}) => {
  return (
    <div className="dice-roll-container">
      <div className="dice-area">
        <h3>Dés en jeu</h3>
        <div className="dice-display">
          {dice.map((die, index) => (
            <Button variant='primary' key={index} onClick={() => onKeep(index)}>
              {die}
            </Button>
          ))}
        </div>
      </div>

      <div className="kept-dice-area">
        <h3>Dés gardés</h3>
        <div className="kept-dice-display">
          {keptDice.map((die, index) => (
            <span key={index} className="kept-die">
              {die}
            </span>
          ))}
        </div>
      </div>

      <div className="roll-controls">
        <Button 
          onClick={onRoll} 
          disabled={rollsLeft === 0}
          variant="primary"
        >
          Lancer ({rollsLeft} restants)
        </Button>
      </div>
    </div>
  );
};