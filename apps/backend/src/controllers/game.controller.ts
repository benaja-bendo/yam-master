import { interpret, InterpreterFrom } from 'xstate';
import { Request, Response } from 'express';
import { gameMachine } from '@yamaster/logic';
import { WebSocketManager } from '../config/websocket';

export class GameController {
  private games: Map<string, InterpreterFrom<typeof gameMachine>>;
  private wsManager: WebSocketManager;

  constructor(wsManager: WebSocketManager) {
    this.games = new Map();
    this.wsManager = wsManager;
  }

  async startGame(req: Request, res: Response) {
    const { gameId, diceCount } = req.body as {
      gameId: string;
      diceCount?: number;
    };

    if (this.games.has(gameId)) {
      return res.status(400).json({ error: 'Game already exists' });
    }

    const service = interpret(gameMachine)
      .onTransition((state) => {
        this.wsManager.notifyGameUpdate(gameId, service);
      })
      .start();

    service.send({ type: 'START_GAME', diceCount });
    this.games.set(gameId, service);

    return res.json({
      gameId,
      state: service.getSnapshot().value,
      context: service.getSnapshot().context,
    });
  }

  async getGameState(req: Request, res: Response) {
    const { gameId } = req.params;
    const service = this.games.get(gameId);

    if (!service) {
      return res.status(404).json({ error: 'Game not found' });
    }

    return res.json({
      gameId,
      state: service.getSnapshot().value,
      context: service.getSnapshot().context,
    });
  }

  async sendEvent(req: Request, res: Response) {
    const { gameId } = req.params;
    const event = req.body;

    const service = this.games.get(gameId);
    if (!service) {
      return res.status(404).json({ error: 'Game not found' });
    }

    try {
      service.send(event);
      return res.json({
        gameId,
        state: service.getSnapshot().value,
        context: service.getSnapshot().context,
      });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid event' });
    }
  }
}
