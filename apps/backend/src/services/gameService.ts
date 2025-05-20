import WebSocket from "ws";
import { createActor, ActorRefFrom } from "xstate";
import { gameMachine } from "../machines/gameMachine";
import { GameContext, GameEvent, Cell, evaluateCombinations } from "@yamaster/logic";

type GameActor = ActorRefFrom<typeof gameMachine>;

interface CreateOptions {
  mode: "pvp" | "pvb";
  botDifficulty?: "easy" | "hard";
  diceCount?: number;
}

interface GameRecord {
  actor: GameActor;
  clients: Set<WebSocket>;
}

export class GameService {
  private games = new Map<string, GameRecord>();

  public createPvPGame(gameId: string, diceCount = 5) {
    return this._createGame(gameId, { mode: "pvp", diceCount });
  }

  public createPvBGame(gameId: string, botDifficulty: "easy" | "hard" = "easy", diceCount = 5) {
    return this._createGame(gameId, { mode: "pvb", botDifficulty, diceCount });
  }

  private _createGame(gameId: string, options: CreateOptions) {
    if (this.games.has(gameId)) throw new Error(`Game ${gameId} already exists`);

    const actor = createActor(gameMachine);
    actor.start();
    actor.send({
      type: "START_GAME",
      mode: options.mode,
      diceCount: options.diceCount,
      ...(options.mode === "pvb" && { botDifficulty: options.botDifficulty }),
    } as GameEvent);

    if (options.mode === "pvb") this._attachBotLogic(actor);

    this.games.set(gameId, { actor, clients: new Set() });
    return actor.getSnapshot();
  }

  private _attachBotLogic(actor: GameActor) {
    actor.subscribe((state) => {
      const { currentPlayerIndex, rollsLeft, dice } = state.context;

      if (currentPlayerIndex === 1 && state.matches("playing.playerTurn.rollPhase")) {
        actor.send({ type: "ROLL" });
      } else if (currentPlayerIndex === 1 && state.matches("playing.playerTurn.choosePhase")) {
        if (rollsLeft! > 0) {
          actor.send({ type: "ROLL" });
        } else {
          const combos = evaluateCombinations(dice!);
          const choice = combos[0];
          const cell = this._getFirstFreeCell(state.context, 1);
          actor.send({ type: "CHOOSE_COMBINATION", combination: choice, cell } as GameEvent);
          actor.send({ type: "ACCEPT_COMBINATION", cell } as GameEvent);
        }
      }
    });
  }

  private _getFirstFreeCell(context: GameContext, playerIndex: number): Cell {
    const occupied = new Set(Object.keys(context.players[playerIndex].occupied));
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const key = `${x}:${y}`;
        if (!occupied.has(key)) return { x, y };
      }
    }
    return { x: 0, y: 0 };
  }

  public subscribeClient(gameId: string, ws: WebSocket) {
    const rec = this.games.get(gameId);
    if (!rec) throw new Error(`Game ${gameId} not found`);
    rec.clients.add(ws);
    
    ws.send(JSON.stringify({ type: "STATE_INIT", state: rec.actor.getSnapshot() }));
    ws.on("close", () => rec.clients.delete(ws));
  }

  public sendEventToGame(gameId: string, event: GameEvent) {
    const rec = this.games.get(gameId);
    if (!rec) throw new Error(`Game ${gameId} not found`);
    rec.actor.send(event);
    const state = rec.actor.getSnapshot();
    const msg = JSON.stringify({ type: "STATE_UPDATE", state });
    for (const ws of rec.clients) {
      if (ws.readyState === ws.OPEN) ws.send(msg);
    }
    return state;
  }

  public getGameState(gameId: string) {
    const rec = this.games.get(gameId);
    if (!rec) throw new Error(`Game ${gameId} not found`);
    return rec.actor.getSnapshot();
  }
}

export const gameService = new GameService();
