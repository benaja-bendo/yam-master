import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import type { GameResponse } from "@/api/gameApi.ts";
import { joinGame, fetchGameState, sendEventToGame } from "@/api/gameApi.ts";
import Board from "./Board.tsx";

export const GamePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const playerId = searchParams.get("playerId") as
    | "player1"
    | "player2"
    | null;

  const [gameState, setGameState] = useState<GameResponse["state"] | null>(
    null
  );
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!gameId || !playerId) return;

    const initGame = async () => {
      try {
        let res: GameResponse;
        if (playerId === "player2") {
          // Joueur 2 en mode PvP : on rejoint la partie
          res = await joinGame(gameId, "player2");
        } else {
          // Joueur 1 (PvP) ou solo (PvB) : on récupère l'état initial
          res = await fetchGameState(gameId);
        }

        // On mémorise l'état initial
        setGameState(res.state);

        // On ouvre le WS pour les mises à jour (joueur1 comme joueur2)
        const ws = new WebSocket(
          `ws://${window.location.hostname}:3000/ws?gameId=${gameId}&playerId=${playerId}`
        );

        ws.onmessage = (evt) => {
          const msg = JSON.parse(evt.data);
          console.log("Received message:", msg);
          // On met à jour l'état du jeu en cas de message STATE_UPDATE reçu par le WS
          if (msg.type === "STATE_UPDATE") {
            setGameState(msg.state);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("Init game failed:", err);
      }
    };

    initGame();

    // Cleanup à la fermeture du composant
    return () => {
      wsRef.current?.close();
    };
  }, [gameId, playerId]);

  if (!gameId || !playerId) {
    return <div>Paramètres manquants dans l’URL.</div>;
  }
  if (!gameState) {
    return <div>Chargement de la partie…</div>;
  }

  // Handler lancer les dés
  const handleRoll = () => {
    sendEventToGame(gameId, { type: "ROLL" }).catch(console.error);
  };

  // Handler choix de combinaison + accept
  const handleChoose = (combo: string, cell: { x: number; y: number }) => {
    sendEventToGame(gameId, {
      type: "CHOOSE_COMBINATION",
      combination: combo,
      cell,
    })
      .then(() =>
        sendEventToGame(gameId, {
          type: "ACCEPT_COMBINATION",
          cell,
        })
      )
      .catch(console.error);
  };

  return (
    // <p>Le Board</p>
    <Board
      state={gameState}
      context={gameState.context}
      onRoll={handleRoll}
      onChoose={handleChoose}
      mode={gameState.context.mode}
    />
  );
};
