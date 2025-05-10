import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { InterpreterFrom } from 'xstate';
import { gameMachine } from '@yamaster/logic';

interface GameConnection {
  gameId: string;
  players: Set<WebSocket>;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private gameConnections: Map<string, GameConnection> = new Map();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: WebSocket) {
    socket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(socket, message);
      } catch (error) {
        socket.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
      }
    });

    socket.on('close', () => this.handleClose(socket));
  }

  private handleMessage(socket: WebSocket, message: any) {
    switch (message.type) {
      case 'join_game':
        this.joinGame(socket, message.gameId, message.playerId);
        break;
      default:
        socket.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
    }
  }

  private joinGame(socket: WebSocket, gameId: string, playerId: string) {
    let connection = this.gameConnections.get(gameId);
    if (!connection) {
      connection = { gameId, players: new Set() };
      this.gameConnections.set(gameId, connection);
    }
    
    connection.players.add(socket);
    socket.send(JSON.stringify({ type: 'joined', gameId, playerId }));
  }

  private handleClose(socket: WebSocket) {
    this.gameConnections.forEach((connection, gameId) => {
      if (connection.players.has(socket)) {
        connection.players.delete(socket);
        if (connection.players.size === 0) {
          this.gameConnections.delete(gameId);
        }
      }
    });
  }

  public notifyGameUpdate(gameId: string, service: InterpreterFrom<typeof gameMachine>) {
    const connection = this.gameConnections.get(gameId);
    if (!connection) return;

    const update = {
      type: 'game_update',
      gameId,
      state: service.getSnapshot().value,
      context: service.getSnapshot().context
    };

    connection.players.forEach(socket => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(update));
      }
    });
  }
}

export const setupWebSocket = (server: HttpServer): WebSocketManager => {
  return new WebSocketManager(server);
};