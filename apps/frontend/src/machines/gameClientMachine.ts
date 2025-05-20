import { createMachine, assign } from "xstate";
import type { GameContext, GameState } from "@yamaster/logic";
import { createGame, joinGame, fetchGameState, sendEventToGame } from "../api/gameApi";

interface ClientContext {
  gameId: string | null;
  playerId: "player1" | "player2";
  stateValue: GameState["value"] | null;
  gameContext: GameContext | null;
}

type ClientEvent =
  | { type: "INIT" }
  | { type: "WS_OPENED" }
  | { type: "REMOTE_UPDATE"; value: GameState["value"]; context: GameContext }
  | { type: "ROLL" }
  | { type: "CHOOSE"; combination: string; cell: { x: number; y: number } }
  | { type: "ERROR"; message: string };

export const gameClientMachine = createMachine<ClientContext, ClientEvent>({
  id: "gameClient",
  initial: "init",
  context: {
    gameId: null,
    playerId: "player1",
    stateValue: null,
    gameContext: null,
  },
  states: {
    init: {
      entry: "loadParams",
      invoke: {
        src: "initGame",
        onDone: {
          target: "connected",
          actions: assign((_, e) => ({
            gameId: e.data.gameId,
            stateValue: e.data.state.value,
            gameContext: e.data.state.context,
          })),
        },
        onError: {
          target: "failure",
          actions: assign({ /* capture e.data */ }),
        },
      },
    },
    connected: {
      entry: "openWebSocket",
      on: {
        WS_OPENED: "ready",
        ERROR: "failure",
      },
    },
    ready: {
      on: {
        REMOTE_UPDATE: {
          actions: assign((ctx, e) => ({
            stateValue: e.value,
            gameContext: e.context,
          })),
        },
        ROLL: {
          actions: "doRoll",
        },
        CHOOSE: {
          actions: "doChoose",
        },
      },
    },
    failure: {
      type: "final",
    },
  },
},
{
  actions: {
    loadParams: assign((ctx, e) => {
      const search = new URLSearchParams(window.location.search);
      return {
        playerId: (search.get("playerId") as "player1" | "player2"),
        gameId: search.get("gameId"), // null si player1
      };
    }),
    openWebSocket: (ctx, _e) => {
      if (!ctx.gameId) return;
      const ws = new WebSocket(`ws://localhost:3000/ws?gameId=${ctx.gameId}`);
      ws.onopen = () => service.send("WS_OPENED");
      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.type === "STATE_UPDATE") {
          service.send({
            type: "REMOTE_UPDATE",
            value: msg.state.value,
            context: msg.state.context,
          });
        }
      };
      ws.onerror = () => service.send({ type: "ERROR", message: "WS error" });
    },
    doRoll: (ctx, _e) => {
      if (!ctx.gameId) return;
      sendEventToGame(ctx.gameId, { type: "ROLL" });
    },
    doChoose: (ctx, e) => {
      if (!ctx.gameId) return;
      sendEventToGame(ctx.gameId, {
        type: "CHOOSE_COMBINATION",
        combination: e.combination,
        cell: e.cell,
      });
      sendEventToGame(ctx.gameId, {
        type: "ACCEPT_COMBINATION",
        cell: e.cell,
      });
    },
  },
  services: {
    initGame: async (ctx) => {
      // si player1, création, sinon join puis fetch
      if (ctx.playerId === "player1") {
        const { gameId, state } = await createGame({
          mode: /* récupéré dans la page ou via UI */,
          botDifficulty: /* idem */,
          diceCount: /* idem */,
        });
        return { gameId, state };
      } else {
        await joinGame(ctx.gameId!, "player2");
        const state = await fetchGameState(ctx.gameId!);
        return { gameId: ctx.gameId!, state };
      }
    },
  },
});
