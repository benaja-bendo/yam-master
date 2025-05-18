import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../App.styles';

interface CombinationsProps {
  availableCombinations: string[];
  onChoose: (combination: string) => void;
}

const CombinationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;

  h3 {
    color: #e0e0e0;
    margin-bottom: 0.5rem;
  }
`;

const CombinationsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;

  button {
    width: 100%;
    padding: 0.8rem;
    font-size: 0.9rem;
    text-transform: capitalize;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

export const Combinations: React.FC<CombinationsProps> = ({
  availableCombinations,
  onChoose,
}) => {
  return (
    <CombinationsContainer>
      <h3>Combinaisons Disponibles</h3>
      <CombinationsList>
        {availableCombinations.map((combination) => (
          <Button
            key={combination}
            onClick={() => onChoose(combination)}
            variant="secondary"
          >
            {combination}
          </Button>
        ))}
      </CombinationsList>
    </CombinationsContainer>
  );
};