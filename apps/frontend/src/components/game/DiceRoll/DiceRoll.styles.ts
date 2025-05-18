import styled from 'styled-components';

export const DiceRollContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

export const DiceArea = styled.div`
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #e0e0e0;
  }
`;

export const DiceDisplay = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;

  button {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
    border-radius: 12px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }
  }
`;

export const KeptDiceArea = styled(DiceArea)`
  .kept-die {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    margin: 0 0.5rem;
    background: #4a4a4a;
    color: white;
    border-radius: 8px;
    font-size: 1.3rem;
  }
`;

export const RollControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;

  button {
    min-width: 200px;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;