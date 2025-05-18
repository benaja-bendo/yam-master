import { useEffect, useRef, useState, useCallback } from 'react';

export type WSMessage =
  | { type: 'STATE_INIT'; state: any }
  | { type: 'STATE_UPDATE'; state: any }
  | { type: 'ERROR'; message: string };

export function useGameSocket(gameId: string, playerId: string) {
  const [state, setState] = useState<any>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket>();
  const reconnectTimeoutRef = useRef<number>();

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer le message:', msg);
    }
  }, []);

  const connect = useCallback(() => {
    if (!gameId) return;
    
    // Nettoyer toute tentative de reconnexion précédente
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }

    const url = (import.meta.env.DEV
      ? 'ws://localhost:3000/ws'
      : `${window.location.origin}/ws`
    );
    
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setConnected(true);
      setError(null);
      console.log(`WebSocket connecté pour la partie ${gameId} en tant que ${playerId}`);
      ws.send(JSON.stringify({ type: 'JOIN', gameId, playerId }));
    });
    
    ws.addEventListener('message', (ev) => {
      try {
        const msg: WSMessage = JSON.parse(ev.data);
        if (msg.type === 'STATE_INIT' || msg.type === 'STATE_UPDATE') {
          setState(msg.state);
        } else if (msg.type === 'ERROR') {
          setError(msg.message);
          console.error('Erreur WebSocket:', msg.message);
        }
      } catch (err) {
        console.error('Erreur lors du traitement du message WebSocket:', err);
      }
    });
    
    ws.addEventListener('close', (event) => {
      setConnected(false);
      console.log(`WebSocket déconnecté, code: ${event.code}, raison: ${event.reason}`);
      
      // Tentative de reconnexion après 3 secondes
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('Tentative de reconnexion WebSocket...');
        connect();
      }, 3000);
    });
    
    ws.addEventListener('error', () => {
      setConnected(false);
      setError('Erreur de connexion au serveur de jeu');
      console.error('Erreur de connexion WebSocket');
    });
    
    return () => {
      ws.close();
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [gameId, playerId]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return { state, send, connected, error };

}