import { Router } from "express";
import * as controller from "../controllers/game.controller";

const gameRouter = Router();

// POST /api/games - Création d'une partie
gameRouter.post("/", controller.createGame);

// GET /api/games/:gameId - État de la partie
gameRouter.get("/:gameId", controller.getGameState);

// POST /api/games/:gameId/join - Rejoindre une partie
gameRouter.post("/:gameId/join", controller.joinGame);

// POST /api/games/:gameId/action - Actions de jeu (ROLL, KEEP, SCORE)
gameRouter.post("/:gameId/action", controller.postGameEvent);

export { gameRouter };
