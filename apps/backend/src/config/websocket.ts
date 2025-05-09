import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export class WebSocketManager {
  private wss: WebSocketServer;

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: WebSocket) {
    console.log('Nouvelle connexion WebSocket établie');

    socket.on('message', (message: Buffer) => {
      this.handleMessage(socket, message);
    });

    socket.on('close', () => {
      this.handleClose(socket);
    });
  }

  private handleMessage(socket: WebSocket, message: Buffer) {
    console.log('Message reçu:', message.toString());
    // Implémentation du traitement des messages
  }

  private handleClose(socket: WebSocket) {
    console.log('Connexion WebSocket fermée');
    // Nettoyage des ressources si nécessaire
  }

  public broadcast(message: string) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export const setupWebSocket = (server: HttpServer): WebSocketManager => {
  return new WebSocketManager(server);
};