import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createGameSchema } from "../validation/createGame";
import { z } from "zod";
import {
  createGame,
  sendEvent,
  getGameState,
} from "../controllers/game.controller";

const gameRouter = Router();

// POST /api/games - Création d'une partie
// exemple de requête:
// {
//   "mode": "pvp" | "pvb",
//   "botDifficulty": "easy" | "hard"
// }
gameRouter.post("/", validate(createGameSchema), createGame);

// POST /api/games/:gameId/event - Actions de jeu (ROLL, KEEP, SCORE)
// exemple de requête:
// {
//   "type": "ROLL" | "CHOOSE_COMBINATION" | "ACCEPT_COMBINATION",
//   "playerId": "player1" | "player2",
//   "diceIndex": 0 | 1 | 2 | 3 | 4
// }
gameRouter.post(
  "/:gameId/event",
  validate(
    z.object({
      type: z.enum(["ROLL", "CHOOSE_COMBINATION", "ACCEPT_COMBINATION"]),
      playerId: z.string(),
      diceIndex: z.number().optional(),
    })
  ),
  sendEvent
);

// GET /api/games/:gameId  - État de la partie
// exemple de réponse:
// {
//   "state": {
//     "players": [
//       {
//         "id": "player1",
//         "name": "Player 1",
//         "score": 0,
//         "dice": [1, 2, 3, 4, 5],
//         "turn": true,
//         "isBot": false
//       },
//       {
//         "id": "player2",
//         "name": "Player 2",
//         "score": 0,
//         "dice": [1, 2, 3, 4, 5],
//         "turn": false,
//         "isBot": true
//       }
//     ],
//     "currentPlayerIndex": 0,
//     "dice": [1, 2, 3, 4, 5],
//     "turn": true,
//     "isBotTurn": false,
//     "mode": "pvb",
//     "botDifficulty": "easy"
//   }
// }
gameRouter.get("/:gameId", getGameState);

// GET /api/games/:gameId - État de la partie
// gameRouter.get("/:gameId", controller.getGameState);

// POST /api/games/:gameId/join - Rejoindre une partie
// gameRouter.post("/:gameId/join", controller.joinGame);

// POST /api/games/:gameId/events - Actions de jeu (ROLL, KEEP, SCORE)
// gameRouter.post("/:gameId/events", controller.postGameEvent);

export { gameRouter };
