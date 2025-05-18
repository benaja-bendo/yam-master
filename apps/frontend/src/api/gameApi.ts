import axios from "axios";

const base = import.meta.env.DEV 
  ? 'http://localhost:3000/api' 
  : '/api';

export interface CreateGameParams {
  mode: 'pvp' | 'pvb';
  botDifficulty?: 'easy' | 'hard';
  diceCount?: number;
}

export async function createGame(params: CreateGameParams) {
  const { data } = await axios.post(`${base}/games`, params);
  return data as { gameId: string; state: any };
}

export async function joinGame(gameId: string, playerId: 'player2') {
  const { data } = await axios.post(`${base}/games/${gameId}/join`, { playerId });
  return data.state as any;
}

export async function fetchGameState(gameId: string) {
  const { data } = await axios.get(`${base}/games/${gameId}`);
  return data.state as any;
}