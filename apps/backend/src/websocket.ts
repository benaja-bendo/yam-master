import { WebSocketServer, WebSocket } from 'ws';

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (socket: WebSocket) => {
    console.log('Connexion WebSocket');

    socket.on('message', (message: Buffer) => {
      console.log('Reçu:', message.toString());

      // Logique de jeu ici ou appel à XState
    });

    socket.on('close', () => {
      console.log('Déconnexion WebSocket');
    });
  });
}
