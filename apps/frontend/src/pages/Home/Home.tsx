import React, { useState } from 'react';
import { FaQuestionCircle, FaCog, FaInstagram, FaTwitter } from 'react-icons/fa';
import { Container, Footer, FooterLink, Header, HelpIcon, Main, SettingsIcon, Socials, Title } from '../../App.styles.ts';
import { Lobby } from '../../components/Lobby';
import { useNavigate } from 'react-router';

export const Home: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStart = (id: string, pid: 'player1' | 'player2') => {
    // Rediriger vers la page de jeu avec les paramètres nécessaires
    navigate(`/game?gameId=${id}&playerId=${pid}`);
  };

  return (
    <Container>
      <Header>
        <HelpIcon>
          <FaQuestionCircle />
        </HelpIcon>
        <SettingsIcon>
          <FaCog />
        </SettingsIcon>
      </Header>

      <Main>
        <Title>yamaster</Title>

        {error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'red' }}>{error}</p>
            <button 
              onClick={() => setError(null)} 
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
          <Lobby onStart={handleStart} />
        )}
      </Main>

      <Footer>
        <FooterLink href="#">Contact</FooterLink>
        <FooterLink href="#">Privacy Policy</FooterLink>
        <Socials>
          <a href="#">
            <FaInstagram />
          </a>
          <a href="#" style={{ marginLeft: 12 }}>
            <FaTwitter />
          </a>
        </Socials>
      </Footer>
    </Container>
  );
};
