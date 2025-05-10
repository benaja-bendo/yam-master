import express from "express";
import { createServer } from "http";
import { serverConfig } from "./config/server";
import { setupWebSocket } from "./config/websocket";
import routes from "./routes";
import { GameController } from './controllers/game.controller';

const app = express();
const server = createServer(app);

// Middleware pour parser le JSON
app.use(express.json());

// Configuration WebSocket
const wsManager = setupWebSocket(server);

// Initialisation du contrôleur avec le gestionnaire WebSocket
const gameController = new GameController(wsManager);

// Configuration des routes
app.use("/api", routes);

// Démarrage du serveur
server.listen(serverConfig.port, () => {
  console.log(
    `Serveur en cours d'exécution => http://localhost:${serverConfig.port}`
  );
});

export default app;
