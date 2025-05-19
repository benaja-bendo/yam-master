import axios from "axios";
import type { GameState, GameContext } from "@yamaster/logic";

const base = import.meta.env.DEV 
  ? 'http://localhost:3000/api' 
  : '/api';

export interface CreateGameParams {
  mode: 'pvp' | 'pvb';
  botDifficulty?: 'easy' | 'hard';
  diceCount?: number;
}

export interface GameStateResponse {
  value: GameState['value'];
  context: GameContext;
}

export interface GameResponse {
  state: GameState['value'];
  context: GameContext;
}

export async function createGame(params: CreateGameParams) {
  const { data } = await axios.post(`${base}/games`, params);
  return data as { gameId: string; state: GameStateResponse };
}

export async function joinGame(gameId: string, playerId: 'player2') {
  const { data } = await axios.post(`${base}/games/${gameId}/join`, { playerId });
  return data as GameResponse;
}

export async function fetchGameState(gameId: string) {
  const { data } = await axios.get(`${base}/games/${gameId}`);
  console.log(data);
  
  return data as GameResponse;
}