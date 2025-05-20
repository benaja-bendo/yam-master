import type { RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import { gameService } from "../services/gameService";
import type { BodyCreateGame } from "../types/index";

export const createGame: RequestHandler<{}, any, BodyCreateGame> = (req, res) => {
  const { mode, botDifficulty } = req.body;
  const gameId = uuidv4();
  const snapshot =
    mode === "pvb"
      ? gameService.createPvBGame(gameId, botDifficulty!)
      : gameService.createPvPGame(gameId);
  res.status(201).json({ gameId, mode, state: snapshot });
};

export const joinGame: RequestHandler<{ gameId: string }> = (req, res) => {
  const { gameId } = req.params;
  const { playerId } = req.body;
  const state = gameService.sendEventToGame(gameId, { type: "JOIN", playerId });
  res.json({ state });
};

export const getGameState: RequestHandler<{ gameId: string }> = (req, res) => {
  const { gameId } = req.params;
  const state = gameService.getGameState(gameId);
  res.json({ state });
};

export const sendEvent: RequestHandler<{ gameId: string }> = (req, res) => {
  const { gameId } = req.params;
  const event = req.body;
  const state = gameService.sendEventToGame(gameId, event);
  res.json({ state });
};
