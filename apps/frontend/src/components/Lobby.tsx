import React, { useState } from 'react';
import { createGame, joinGame } from '../api/gameApi';
import { Button } from '../App.styles';
import styled from 'styled-components';

interface Props {
  onStart: (gameId: string, playerId: 'player1' | 'player2') => void;
}

// Définition des composants styled en dehors du composant fonctionnel
const LobbyContainer = styled.div`
  background: rgba(44, 77, 63, 0.2);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LobbyTitle = styled.h2`
  color: #e8f478;
  font-size: 2rem;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 6px;
  color: #b0c4a5;
`;

const Select = styled.select`
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

const Input = styled.input`
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

const Divider = styled.div`
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

export const Lobby: React.FC<Props> = ({ onStart }) => {
  const [mode, setMode] = useState<'pvp' | 'pvb'>('pvb');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [gameIdInput, setGameIdInput] = useState('');

  const handleNew = async () => {
    const { gameId } = await createGame({ mode, botDifficulty: difficulty });
    onStart(gameId, 'player1');
  };

  const handleJoin = async () => {
    await joinGame(gameIdInput, 'player2');
    onStart(gameIdInput, 'player2');
  };

  return (
    <LobbyContainer>
      <LobbyTitle>Nouvelle Partie</LobbyTitle>
      
      <FormGroup>
        <Label>Mode de jeu</Label>
        <Select value={mode} onChange={(e) => setMode(e.target.value as any)}>
          <option value="pvb">Solo (Joueur vs Bot)</option>
          <option value="pvp">Multijoueur (Joueur vs Joueur)</option>
        </Select>
      </FormGroup>
      
      {mode === 'pvb' && (
        <FormGroup>
          <Label>Difficulté</Label>
          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
          >
            <option value="easy">Facile</option>
            <option value="hard">Difficile</option>
          </Select>
        </FormGroup>
      )}
      
      <ButtonContainer>
        <Button variant="primary" onClick={handleNew}>
          Créer une partie
        </Button>
      </ButtonContainer>

      {mode === 'pvp' && (
        <>
          <Divider>
            <span>OU</span>
          </Divider>
          
          <FormGroup>
            <Label>Rejoindre une partie existante</Label>
            <Input
              placeholder="Identifiant de la partie"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
            />
          </FormGroup>
          
          <ButtonContainer>
            <Button variant="dark" onClick={handleJoin}>
              Rejoindre
            </Button>
          </ButtonContainer>
        </>
      )}
    </LobbyContainer>
  );
};
