import express from "express";
import { createServer } from "http";
import { serverConfig } from "./config/server";
import routes from "./routes/index";
import { gameRouter } from "./routes/game.js";

const app = express();
const server = createServer(app);
app.use(express.json());
// Configuration des routes
app.use("/api", routes);
app.use('/api/game', gameRouter);

// Démarrage du serveur
server.listen(serverConfig.port, () => {
  console.log(
    `Serveur en cours d'exécution => http://localhost:${serverConfig.port}`
  );
});

export default app;
