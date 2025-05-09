import express from "express";
import { createServer } from "http";
import { serverConfig } from "./config/server";
import { setupWebSocket } from "./config/websocket";
import routes from "./routes";

const app = express();
const server = createServer(app);

// Middleware pour parser le JSON
app.use(express.json());

// Configuration des routes
app.use("/api", routes);

// Configuration WebSocket
setupWebSocket(server);

// Démarrage du serveur
server.listen(serverConfig.port, () => {
  console.log(
    `Serveur en cours d'exécution => http://localhost:${serverConfig.port}`
  );
});

export default app;
