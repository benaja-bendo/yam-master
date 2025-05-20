import React, { useState } from 'react';
import { createGame, joinGame } from '../api/gameApi';
import { Button } from '@/App.styles.ts';
import {
  Divider,
  FormGroup,
  Label,
  LobbyContainer,
  LobbyTitle,
  ButtonContainer,
  Input,
  Select
} from "@/components/Lobby.Styles";

interface Props {
  onStart: (gameId: string, playerId: 'player1' | 'player2', mode: 'pvp'|'pvb') => void;
}

export const Lobby: React.FC<Props> = ({ onStart }) => {
  const [mode, setMode] = useState<'pvp' | 'pvb'>('pvb');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [gameIdInput, setGameIdInput] = useState('');

  const handleNew = async () => {
    const { gameId } = await createGame({ mode, botDifficulty: difficulty });
    onStart(gameId, 'player1',mode);
  };

  const handleJoin = async () => {
    await joinGame(gameIdInput, 'player2');
    onStart(gameIdInput, 'player2',mode);
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
            <Button $variant="primary" onClick={handleJoin}>
              Rejoindre
            </Button>
          </ButtonContainer>
        </>
      )}
    </LobbyContainer>
  );
};
