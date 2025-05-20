import axios from "axios";
import type { GameState, GameContext } from "@yamaster/logic";

/**
 * Point d'entrée selon l'environnement
 */
const base = import.meta.env.DEV
  ? "http://localhost:3000/api"
  : "/api";

type PlayerId = "player1" | "player2";

/** Paramètres pour la création de partie */
export interface CreateGameParams {
  mode: "pvp" | "pvb";
  botDifficulty?: "easy" | "hard";
  diceCount?: number;
}

/** Réponse brute du serveur incluant gameId et état initial */
export interface CreateGameResponse {
  gameId: string;
  mode: "pvp" | "pvb";
  state: {
    value: GameState["value"];
    context: GameContext;
  };
}

/** Réponse pour les actions join, fetch, event */
export interface GameResponse {
  state: {
    value: GameState["value"];
    context: GameContext;
  };
}

/** Crée une partie PvP ou PvB selon params */
export async function createGame(
  params: CreateGameParams
): Promise<CreateGameResponse> {
  const { data } = await axios.post(`${base}/games`, params);
  return data as CreateGameResponse;
}

/** Rejoint une partie existante en tant que player2 */
export async function joinGame(
  gameId: string,
  playerId: "player2"
): Promise<GameResponse> {
  const { data } = await axios.post(
    `${base}/games/${gameId}/join`,
    { playerId }
  );
  return data as GameResponse;
}

/** Récupère l'état courant d'une partie */
export async function fetchGameState(
  gameId: string
): Promise<GameResponse> {
  // GET /api/games/:gameId
  const { data } = await axios.get(`${base}/games/${gameId}`);
  return data as GameResponse;
}

/** Envoie un événement de jeu (ROLL, CHOOSE_COMBINATION, ACCEPT_COMBINATION) */
export async function sendEventToGame(
  gameId: string,
  event: any
): Promise<GameResponse> {
  const { data } = await axios.post(
    `${base}/games/${gameId}/event`,
    event
  );
  return data as GameResponse;
}