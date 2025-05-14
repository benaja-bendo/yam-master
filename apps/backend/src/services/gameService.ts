import { gameMachine } from "@/machines/gameMachine.js";
import { GameEvent } from "@yamaster/logic/src/types.js";
import { createActor, ActorRefFrom } from "xstate";

type GameActor = ActorRefFrom<typeof gameMachine>;

interface CreateOptions {
  mode: "pvp" | "pvb";
  botDifficulty?: "easy" | "hard";
}

interface GameRecord {
  actor: GameActor;
  clients: Set<WebSocket>;
  // players: Set<string>;
  // mode: "pvp" | "pvb";
  // botDifficulty?: "easy" | "hard";
}

const games = new Map<string, GameRecord>();

/**
 * Crée une nouvelle partie et démarre la machine.
 * @param gameId Identifiant de la partie.
 * @param options Options de la partie.
 */
export function createGame(gameId: string, options: CreateOptions) {
  if (games.has(gameId)) {
    throw new Error(`Game ${gameId} already exists`);
  }

  // 1. Crée l’acteur à partir de la machine
  const actor = createActor(gameMachine);

  // 2. Démarre la machine en lui envoyant TOUT le payload START_GAME
  actor.start({
    type: "START_GAME",
    mode: options.mode,
    // botDifficulty ne sera inclus que si mode==='pvb'
    ...(options.mode === "pvb"
      ? { botDifficulty: options.botDifficulty }
      : {}),
    // diceCount par défaut à 5 si non spécifié
    diceCount: options.diceCount ?? 5,
  } as unknown as GameEvent);

  // 3. Conserve l’acteur et la liste WS
  games.set(gameId, { actor, clients: new Set() });

  // 4. Renvoie immédiatement le snapshot (état + contexte)
  return actor.getSnapshot();
}

/**
 * Ajoute un joueur à une partie.
 * @param gameId Identifiant de la partie.
 * @param playerId Identifiant du joueur.
 * @param ws WebSocket du joueur.
 */
export function joinGame(gameId: string, playerId: string, ws: WebSocket) {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} non trouvée`);
  if (rec.players.has(playerId))
    throw new Error(`Joueur ${playerId} déjà dans la partie`);
  rec.players.add(playerId);
  rec.clients.add(ws);
  return rec.actor.getSnapshot(); // TODO: renvoyer le contexte aussi ?
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
export function sendEventToGame(gameId: string, event: unknown) {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} non trouvée`);
  rec.actor.send(event);
  const state = rec.actor.getSnapshot();
  // Broadcast à tous les WebSocket enregistrés
  const payload = JSON.stringify({ type: "STATE_UPDATE", state });
  for (const ws of rec.clients) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
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
  if (!rec) throw new Error(`Game ${gameId} non trouvée`);
  rec.clients.add(ws);

  // Au moment de l'abonnement, envoie l'état initial
  ws.send(
    JSON.stringify({
      type: "STATE_INIT",
      state: rec.actor.getSnapshot(),
    })
  );

  // Nettoyage à la déconnexion
  ws.on("close", () => {
    rec.clients.delete(ws);
  });
}
