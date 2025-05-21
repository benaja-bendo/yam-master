import React, { useEffect } from "react";
import { Container, Main, Title } from "../../App.styles";
import { GameBoard } from "../../components/GameBoard";
import { useGameSocket } from "../../hooks/useGameSocket";
import { useGameInitialization } from "@/hooks/useGameInitialization.ts";
import { ErrorContainer } from "./GameStyle.ts";

export const Game: React.FC = () => {
  const { gameId, playerId, loading, error, setError } =
    useGameInitialization();
  const {
    state,
    send,
    connected,
    error: socketError,
  } = useGameSocket(gameId!, playerId);

  // Mettre à jour l'erreur si une erreur de socket se produit
  useEffect(() => {
    if (socketError) {
      setError(socketError);
    }
  }, [socketError, setError]);

  // Déterminer le mode de jeu (PvP ou PvB)
  const gameMode = state?.context?.mode || "pvp";
  console.log("gameMode", gameMode);

  if (loading) {
    return (
      <Container>
        <Main>
          <Title>yamaster</Title>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Chargement de la partie...</p>
          </div>
        </Main>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Main>
          <Title>yamaster</Title>
          <ErrorContainer>
            <p>{error}</p>
            <button onClick={() => (window.location.href = "/")}>
              Retour à l'accueil
            </button>
          </ErrorContainer>
        </Main>
      </Container>
    );
  }

  return (
    <Container>
      <Main>
        <Title>yamaster</Title>

        <GameContainer>
          {/* Plateau de jeu principal */}
          <GameBoard context={state?.context || null} send={send} />

          {/* Informations de jeu et statut */}
          <GameInfo>
            <h3>
              Mode de jeu:{" "}
              {gameMode === "pvp"
                ? "Joueur contre Joueur"
                : "Joueur contre Bot"}
            </h3>

            {/* Afficher le lien de partage uniquement pour le joueur 1 en mode PvP */}
            {playerId === "player1" && gameMode === "pvp" && (
              <ShareLink>
                <p>Partagez ce lien pour inviter un joueur :</p>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/game?gameId=${gameId}&playerId=player2`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </ShareLink>
            )}

            <ConnectionStatus connected={connected}>
              {connected
                ? "✓ Connecté au serveur de jeu"
                : "✗ Déconnecté du serveur de jeu"}
            </ConnectionStatus>
          </GameInfo>
        </GameContainer>
      </Main>
    </Container>
  );
};
