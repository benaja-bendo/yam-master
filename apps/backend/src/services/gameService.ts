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

  /** Crée une partie PvP */
  public createPvPGame(gameId: string, diceCount = 5) {
    return this._createGame(gameId, { mode: "pvp", diceCount });
  }

  /** Crée une partie PvB (Player vs Bot) */
  public createPvBGame(
    gameId: string,
    botDifficulty: "easy" | "hard" = "easy",
    diceCount = 5
  ) {
    return this._createGame(gameId, {
      mode: "pvb",
      botDifficulty,
      diceCount,
    });
  }

  /** Méthode interne générique */
  private _createGame(gameId: string, options: CreateOptions) {
    if (this.games.has(gameId)) {
      throw new Error(`Game ${gameId} already exists`);
    }

    // 1. Crée et démarre l’acteur
    const actor = createActor(gameMachine);
    actor.start();

    // 2. Démarre la partie selon le mode
    actor.send({
      type: "START_GAME",
      mode: options.mode,
      diceCount: options.diceCount,
      ...(options.mode === "pvb" && { botDifficulty: options.botDifficulty }),
    } as unknown as GameEvent);

    // 3. Si PvB, on branche le bot
    if (options.mode === "pvb") {
      this._attachBotLogic(actor);
    }

    // 4. Enregistrement
    this.games.set(gameId, { actor, clients: new Set() });

    // 5. Renvoi de l’état initial
    return actor.getSnapshot();
  }

  /** Abonne la logique automatique du bot sur les états de la machine */
  private _attachBotLogic(actor: GameActor) {
    actor.subscribe((state) => {
      const { currentPlayerIndex, rollsLeft, dice } = state.context;

      // Quand c’est au tour du bot et qu’il reste des lancers
      if (
        currentPlayerIndex === 1 &&
        state.matches("playing.playerTurn.rollPhase")
      ) {
        actor.send({ type: "ROLL" });
      }

      // Phase de choix pour le bot
      else if (
        currentPlayerIndex === 1 &&
        state.matches("playing.playerTurn.choosePhase")
      ) {
        if (rollsLeft! > 0) {
          actor.send({ type: "ROLL" });
        } else {
          const combos = evaluateCombinations(dice!);
          const choice = combos[0];
          const cell = this._getFirstFreeCell(state.context, 1);

          actor.send({
            type: "CHOOSE_COMBINATION",
            combination: choice,
            cell,
          } as GameEvent);

          actor.send({
            type: "ACCEPT_COMBINATION",
            cell,
          } as GameEvent);
        }
      }
    });
  }

  /** Trouve la première cellule libre pour un joueur donné */
  private _getFirstFreeCell(
    context: GameContext,
    playerIndex: number
  ): Cell {
    const occupied = new Set(
      Object.keys(context.players[playerIndex].occupied)
    );
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const key = `${x}:${y}`;
        if (!occupied.has(key)) {
          return { x, y };
        }
      }
    }
    // Par sécurité, retourner (0,0)
    return { x: 0, y: 0 };
  }

  /** Ajoute un client WebSocket pour recevoir les mises à jour */
  public subscribeClient(gameId: string, ws: WebSocket) {
    const rec = this.games.get(gameId);
    if (!rec) throw new Error(`Game ${gameId} not found`);

    rec.clients.add(ws);
    // Envoi de l'état initial
    ws.send(JSON.stringify({ type: "STATE_INIT", state: rec.actor.getSnapshot() }));

    ws.on("close", () => rec.clients.delete(ws));
  }

  /** Envoie un événement à la partie et notifie tous les clients */
  public sendEventToGame(gameId: string, event: GameEvent) {
    const rec = this.games.get(gameId);
    if (!rec) throw new Error(`Game ${gameId} not found`);

    rec.actor.send(event);
    const state = rec.actor.getSnapshot();
    const msg = JSON.stringify({ type: "STATE_UPDATE", state });

    for (const ws of rec.clients) {
      if (ws.readyState === ws.OPEN) {
        ws.send(msg);
      }
    }
    return state;
  }

  /** Récupère l’état actuel */
  public getGameState(gameId: string) {
    const rec = this.games.get(gameId);
    if (!rec) throw new Error(`Game ${gameId} not found`);
    return rec.actor.getSnapshot();
  }
}
