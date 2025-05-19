import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GameBoard } from '../../components/GameBoard';
import { useGameSocket } from '../../hooks/useGameSocket';
import { fetchGameState } from '../../api/gameApi';
import { Container, Main, Title } from '../../App.styles.ts';
import type { GameState } from '@yamaster/logic';

export const Game: React.FC = () => {
  const [gameId, setGameId] = useState<string>();
  const [playerId, setPlayerId] = useState<'player1' | 'player2'>('player1');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state, send, connected, error: socketError } = useGameSocket(gameId!, playerId);
  
  // Mettre à jour l'erreur si une erreur de socket se produit
  useEffect(() => {
    if (socketError) {
      setError(socketError);
    }
  }, [socketError]);

  // Récupérer l'état du jeu depuis les paramètres d'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameIdParam = params.get('gameId');
    const playerIdParam = params.get('playerId') as 'player1' | 'player2' | null;
    
    if (!gameIdParam) {
      // Rediriger vers la page d'accueil si aucun gameId n'est fourni
      navigate('/');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    fetchGameState(gameIdParam)
      .then(() => {
        setGameId(gameIdParam);
        if (playerIdParam && (playerIdParam === 'player1' || playerIdParam === 'player2')) {
          setPlayerId(playerIdParam);
        }
      })
      .catch(err => {
        console.error('Erreur lors de la récupération de l\'état du jeu:', err);
        setError('Impossible de rejoindre la partie. Veuillez vérifier l\'ID de la partie.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  return (
    <Container>
      <Main>
        <Title>yamaster</Title>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Chargement de la partie...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'red' }}>{error}</p>
            <button 
              onClick={() => navigate('/')} 
              style={{ 
                padding: '0.5rem 1rem', 
                marginTop: '1rem', 
                background: '#333', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <>
            <GameBoard state={state} send={send} />
            
            {playerId === 'player1' && (
              <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
                <p>Partagez ce lien pour inviter un joueur :</p>
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/game?gameId=${gameId}&playerId=player2`}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    marginTop: '0.5rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px' 
                  }} 
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            )}
            
            <div style={{ 
              textAlign: 'center', 
              marginTop: '0.5rem', 
              padding: '0.5rem', 
              borderRadius: '4px',
              color: connected ? 'green' : 'red',
              fontSize: '0.9rem'
            }}>
              {connected ? '✓ Connecté au serveur de jeu' : '✗ Déconnecté du serveur de jeu'}
            </div>
          </>
        )}
      </Main>
    </Container>
  );
};