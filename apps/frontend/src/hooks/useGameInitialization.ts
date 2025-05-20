import { fetchGameState } from "@/api/gameApi.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export const useGameInitialization = () => {
    const [gameId, setGameId] = useState<string>();
    const [playerId, setPlayerId] = useState<"player1" | "player2">("player1");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const gameIdParam = params.get("gameId");
      const playerIdParam = params.get("playerId") as
        | "player1"
        | "player2"
        | null;
  
      if (!gameIdParam) {
        // Rediriger vers la page d'accueil si aucun gameId n'est fourni
        navigate("/");
        return;
      }
  
      setLoading(true);
      setError(null);
  
      fetchGameState(gameIdParam)
        .then(() => {
          setGameId(gameIdParam);
          if (
            playerIdParam &&
            (playerIdParam === "player1" || playerIdParam === "player2")
          ) {
            setPlayerId(playerIdParam);
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération de l'état du jeu:", err);
          setError(
            "Impossible de rejoindre la partie. Veuillez vérifier l'ID de la partie."
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }, [navigate]);
  
    return { gameId, playerId, loading, error, setError };
  };