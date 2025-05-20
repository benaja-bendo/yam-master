import styled from 'styled-components';

export const LobbyContainer = styled.div`
  background: rgba(44, 77, 63, 0.2);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const LobbyTitle = styled.h2`
  color: #e8f478;
  font-size: 2rem;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1px;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 6px;
  color: #b0c4a5;
`;

export const Select = styled.select`
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #e8f478;
    box-shadow: 0 0 0 2px rgba(232, 244, 120, 0.3);
  }
  
  option {
    background: #2c4d3f;
    color: white;
  }
`;

export const Input = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #e8f478;
    box-shadow: 0 0 0 2px rgba(232, 244, 120, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }
  
  span {
    padding: 0 16px;
    color: #b0c4a5;
    font-size: 0.9rem;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;