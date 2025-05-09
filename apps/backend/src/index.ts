import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { setupWebSocket } from "./websocket";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const server = createServer(app);
setupWebSocket(server);
const wss = new WebSocketServer({ server });

// Middleware pour parser le JSON
app.use(express.json());

// Gestion des connexions WebSocket
wss.on("connection", (socket: WebSocket) => {
  console.log("Nouvelle connexion WebSocket établie");

  socket.on("message", (message: Buffer) => {
    console.log("Message reçu:", message.toString());
  });

  socket.on("close", () => {
    console.log("Connexion WebSocket fermée");
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app;
