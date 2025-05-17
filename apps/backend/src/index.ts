import http from 'node:http';
import express from 'express';
import { setupExpress } from './config';
import { apiRouter } from './routes';
import { initWebSocket } from './websocket';

const app = express();
setupExpress(app);
app.use('/api', apiRouter);

const server = http.createServer(app);
initWebSocket(server);

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';

// Démarrage du serveur
server.listen(port, () => {
  console.log(
    `🚀 Backend listening on http://localhost:${port} en mode ${env}`
  );
});

export default app;