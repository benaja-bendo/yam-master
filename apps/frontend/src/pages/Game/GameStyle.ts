import styled from "styled-components";

// Composants stylisés pour l'interface de jeu
export const GameContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const GameInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ConnectionStatus = styled.div<{ connected: boolean }>`
  text-align: center;
  padding: 8px;
  border-radius: 4px;
  color: ${(props) => (props.connected ? "green" : "red")};
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
`;

export const ShareLink = styled.div`
  text-align: center;
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;

  input {
    width: 100%;
    padding: 8px;
    margin-top: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

export const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;

  p {
    color: #ff6b6b;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #333;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #444;
    }
  }
`;