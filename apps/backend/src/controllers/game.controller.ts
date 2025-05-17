import type { Request, Response } from "express";
import * as gameService from "../services/gameService";
import { v4 as uuidv4 } from "uuid";

export async function createGame(req: Request, res: Response) {
  try {
    const { mode, botDifficulty } = req.body as {
      mode: "pvp" | "pvb";
      botDifficulty?: "easy" | "hard";
    };

    // 1. Validation basique
    if (mode !== "pvp" && mode !== "pvb") {
      return res.status(400).json({ error: "mode must be 'pvp' or 'pvb'" });
    }
    if (mode === "pvb" && !botDifficulty) {
      return res
        .status(400)
        .json({ error: "botDifficulty is required when mode is 'pvb'" });
    }

    // 2. Génération d'un nouvel ID de partie
    const gameId = uuidv4();

    // 3. Démarrage de la partie dans le service
    const snapshot = gameService.createGame(gameId, { mode, botDifficulty });

    // 4. Retour conforme au spec
    return res.status(201).json({
      gameId,
      state: {
        value: snapshot.value,     // ex. "waiting" ou "playing"
        context: snapshot.context, // toute la structure de contexte XState
      },
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function joinGame(req: Request, res: Response) {
  try {
    const { playerId } = req.body as { playerId: 'player2' };
    const snapshot = gameService.joinGame(req.params.gameId, playerId);
    return res.json({
      state: snapshot.value,
      context: snapshot.context,
    });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
}

export async function getGameState(req: Request, res: Response) {
  try {
    const snapshot = gameService.getGameState(req.params.gameId);
    return res.json({
      state: snapshot.value,
      context: snapshot.context,
    });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
}

export async function postGameEvent(req: Request, res: Response) {
  try {
    const event = req.body;
    const snapshot = gameService.sendEventToGame(req.params.gameId, event);
    return res.json({
      state: snapshot.value,
      context: snapshot.context,
    });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
}
