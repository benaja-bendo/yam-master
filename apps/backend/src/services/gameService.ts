import { createActor, ActorRefFrom } from "xstate";
import WebSocket from "ws";
import { GameContext, evaluateCombinations,Cell, GameEvent  } from "@yamaster/logic";
import { gameMachine } from '../machines/gameMachine';

type GameActor = ActorRefFrom<typeof gameMachine>;

interface CreateOptions {
  mode: "pvp" | "pvb";
  botDifficulty?: "easy" | "hard";
  diceCount?: number;
}

interface GameRecord {
  actor: GameActor;
  clients: Set<WebSocket>;
  // players: Set<string>;
  // mode: "pvp" | "pvb";
  // botDifficulty?: "easy" | "hard";
}

const games = new Map<string, GameRecord>();

/** Cherche la première cellule (x,y) libre sur une grille 5×5 */
function getFirstFreeCell(context: GameContext, playerIndex: number): Cell {
  const occupied = new Set<string>(
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
  return { x: 0, y: 0 };
}

/**
 * Crée une nouvelle partie et démarre la machine.
 * @param gameId Identifiant de la partie.
 * @param options Options de la partie.
 */
export function createGame(gameId: string, options: CreateOptions) {
  if (games.has(gameId)) {
    throw new Error(`Game ${gameId} already exists`);
  }

  // 1. Crée l’acteur
  const actor = createActor(gameMachine);

  // 2. Démarre la machine (entre en état 'idle')
  actor.start();

  // 3. Envoie l'événement START_GAME pour qu'elle passe en 'waiting' ou 'playing'
  actor.send({
    type: "START_GAME",
    mode: options.mode,
    diceCount: options.diceCount ?? 5,
    ...(options.mode === "pvb" && { botDifficulty: options.botDifficulty }),
  } as unknown as GameEvent);

  // Si PvB, on branche le bot
  if (options.mode === "pvb") {
    actor.subscribe((state) => {
      // On ne réagit que quand c'est au tour du bot
      if (
        state.context.currentPlayerIndex === 1 &&
        state.matches("playing.playerTurn.rollPhase")
      ) {
        // Premier réflexe : tant qu'il reste des lancers, on relance
        actor.send({ type: "ROLL" });
      }

      // Quand on arrive dans la phase de choix
      else if (
        state.context.currentPlayerIndex === 1 &&
        state.matches("playing.playerTurn.choosePhase")
      ) {
        const { dice, rollsLeft } = state.context;

        // Si on a encore des lancers, mieux vaut relancer
        if (rollsLeft > 0) {
          actor.send({ type: "ROLL" });
        } else {
          // Sinon, on choisit la première combo valide
          const combos = evaluateCombinations(dice);
          const choice = combos[0];
          const cell = getFirstFreeCell(state.context, 1);

          actor.send({
            type: "CHOOSE_COMBINATION",
            combination: choice,
            cell,
          } as GameEvent);

          // Puis on confirme tout de suite
          actor.send({
            type: "ACCEPT_COMBINATION",
            cell,
          } as GameEvent);
        }
      }
    });
  }

  // 4. Sauvegarde et renvoie l'état courant
  games.set(gameId, { actor, clients: new Set() });
  return actor.getSnapshot();
}

/**
 * Ajoute un joueur à une partie.
 * @param gameId Identifiant de la partie.
 * @param playerId Identifiant du joueur.
 */
export function joinGame(gameId: string, playerId: "player2") {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} not found`);
  rec.actor.send({ type: "JOIN", playerId });
  return rec.actor.getSnapshot();
}

/**
 * Récupère l'état courant d'une partie.
 * @param gameId Identifiant de la partie.
 */
export function getGameState(gameId: string) {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} non trouvée`);
  return rec.actor.getSnapshot();
}

/**
 * Envoie un événement XState à la partie, et notifie tous les clients WS.
 * @param gameId Identifiant de la partie.
 * @param event Événement à envoyer.
 */
export function sendEventToGame(gameId: string, event: GameEvent) {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} not found`);
  rec.actor.send(event);
  const state = rec.actor.getSnapshot();
  const msg = JSON.stringify({ type: "STATE_UPDATE", state });
  for (const ws of rec.clients) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
  return state;
}

/**
 * Associe un client WS à une partie pour recevoir les updates.
 * @param gameId Identifiant de la partie.
 * @param ws WebSocket du client.
 */
export function subscribeClient(gameId: string, ws: WebSocket) {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} not found`);
  rec.clients.add(ws);
  ws.send(
    JSON.stringify({ type: "STATE_INIT", state: rec.actor.getSnapshot() })
  );
  ws.addEventListener("close", () => rec.clients.delete(ws));
}
