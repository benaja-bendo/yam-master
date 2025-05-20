import { Server } from "http";
import { WebSocketServer } from "ws";
import { gameService } from "../services/gameService";

export function initWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => { 
    // Récupère gameId et playerId depuis la query string
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const gameId = url.searchParams.get("gameId");
    const playerId = url.searchParams.get("playerId") as
      | "player1"
      | "player2"
      | null;

    if (!gameId || !playerId) {
      console.log("gameId and playerId query params required");
      return ws.close(1008, "gameId and playerId query params required");
    }

    // Abonne le WS aux mises à jour du GameService
    try {
      gameService.subscribeClient(gameId, ws);
    } catch (err: any) {
      console.log(err);
      return ws.close(1008, err.message);
    }

    // Réception des événements utilisateur (ROLL, CHOOSE…, etc.)
    ws.on("message", (raw) => {
      console.log("message", raw.toString());

      let evt;
      try {
        evt = JSON.parse(raw.toString());
      } catch {
        return;
      }
      gameService.sendEventToGame(gameId, evt);
    });
  });
}
