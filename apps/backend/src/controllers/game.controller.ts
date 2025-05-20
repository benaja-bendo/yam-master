import type { Request, RequestHandler, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { GameService } from "../services/gameService";
import { RequestWithBody, BodyCreateGame } from "../types/index";

const gameService = new GameService();

export const createGame: RequestHandler<{}, any, BodyCreateGame> = async (
  req: RequestWithBody<BodyCreateGame>,
  res: Response
) => {
  try {
    // 1. Validation des données reçues
    const { mode, botDifficulty } = req.body;
    // 2. Génération de l’identifiant de la partie
    const gameId = uuidv4();
    // 3. Démarrage de la partie dans le service, selon le mode
    let snapshot;
    if (mode === "pvb") {
      snapshot = gameService.createPvBGame(gameId, botDifficulty!);
    } else {
      snapshot = gameService.createPvPGame(gameId);
    }
    // 4. Retour conforme au spec
    res.status(201).json({
      gameId,
      mode,
      state: snapshot,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const joinGame: RequestHandler<{ gameId: string }> = (req, res) => {
  const { gameId } = req.params;
  const { playerId } = req.body;
  const snapshot = gameService.sendEventToGame(gameId, { type: "JOIN", playerId });
  res.json({ state: snapshot });
};

export const getGameState: RequestHandler<{ gameId: string }> = (req, res) => {
  const { gameId } = req.params;
  const snapshot = gameService.getGameState(gameId);
  res.json({ state: snapshot });
};

export const sendEvent: RequestHandler<{ gameId: string }> = (req, res) => {
  const { gameId } = req.params;
  const event = req.body;
  const snapshot = gameService.sendEventToGame(gameId, event);
  res.json({ state: snapshot });
};