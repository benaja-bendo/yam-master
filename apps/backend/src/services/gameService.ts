import { interpret, InterpreterFrom } from 'xstate';
import { gameMachine } from '../machines/gameMachine';

type GameActor = InterpreterFrom<typeof gameMachine>;
interface GameRecord {
  actor: GameActor;
  clients: Set<WebSocket>; // pour diffuser aux WebSocket connectés
}

const games = new Map<string, GameRecord>();

/**
 * Crée une nouvelle partie et démarre la machine.
 */
export function createGame(gameId: string) {
  if (games.has(gameId)) {
    throw new Error(`Game ${gameId} existe déjà`);
  }
  const actor = interpret(gameMachine).start();
  games.set(gameId, { actor, clients: new Set() });
  return actor.getSnapshot().value;
}

/**
 * Récupère l'état courant d'une partie.
 */
export function getGameState(gameId: string) {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} non trouvée`);
  return rec.actor.getSnapshot();
}

/**
 * Envoie un événement XState à la partie, et notifie tous les clients WS.
 */
export function sendEventToGame(gameId: string, event: unknown) {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} non trouvée`);
  rec.actor.send(event);
  const state = rec.actor.getSnapshot();
  // Broadcast à tous les WebSocket enregistrés
  const payload = JSON.stringify({ type: 'STATE_UPDATE', state });
  for (const ws of rec.clients) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
  return state;
}

/**
 * Associe un client WS à une partie pour recevoir les updates.
 */
export function subscribeClient(gameId: string, ws: WebSocket) {
  const rec = games.get(gameId);
  if (!rec) throw new Error(`Game ${gameId} non trouvée`);
  rec.clients.add(ws);

  // Au moment de l'abonnement, envoie l'état initial
  ws.send(JSON.stringify({
    type: 'STATE_INIT',
    state: rec.actor.getSnapshot(),
  }));

  // Nettoyage à la déconnexion
  ws.on('close', () => {
    rec.clients.delete(ws);
  });
}
