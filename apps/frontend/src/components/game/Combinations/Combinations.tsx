import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../App.styles';

interface CombinationsProps {
  availableCombinations: string[];
  suggestedCombinations: string[];
  onChoose: (combination: string) => void;
}

const CombinationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin-top: 1rem;

  h3 {
    color: #e0e0e0;
    margin-bottom: 0.5rem;
  }
`;

const CombinationsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
`;

const CombinationButton = styled(Button)<{ suggested?: boolean }>`
  width: 100%;
  padding: 0.8rem;
  font-size: 0.9rem;
  text-transform: capitalize;
  background: ${props => props.suggested ? 'rgba(76, 175, 80, 0.7)' : 'rgba(255, 255, 255, 0.1)'};
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.suggested ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

export const Combinations: React.FC<CombinationsProps> = ({
  availableCombinations,
  suggestedCombinations,
  onChoose,
}) => {
  return (
    <CombinationsContainer>
      <h3>Combinaisons Disponibles</h3>
      <CombinationsList>
        {availableCombinations.map((combination) => (
          <CombinationButton
            key={combination}
            variant="secondary"
            suggested={suggestedCombinations.includes(combination)}
            onClick={() => onChoose(combination)}
          >
            {combination}
            {suggestedCombinations.includes(combination) && ' ⭐'}
          </CombinationButton>
        ))}
      </CombinationsList>
    </CombinationsContainer>
  );
};