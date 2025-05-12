import { assign, setup } from "xstate";
import { rollDice, evaluateCombinations } from "./utils";
import { GameContext, GameEvent, defaultBoard, Combination } from "./types";
import { checkAlignment, applyYamPredator } from "./board";

export const SuperGameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  actions: {
    placePawn: assign(({ context, event }) => {
      if (
        event.type !== "ACCEPT_COMBINATION" &&
        event.type !== "USE_YAM_PREDATOR"
      ) {
        return { players: context.players };
      }

      if (event.type === "USE_YAM_PREDATOR") {
        return {
          players: applyYamPredator(
            context.players,
            context.currentPlayerIndex,
            event.cell
          ),
        };
      }

      const updatedPlayers = [...context.players];
      const player = updatedPlayers[context.currentPlayerIndex];
      const key = `${event.cell.x}:${event.cell.y}`;

      if (player.occupied[key]) {
        return { players: context.players };
      }

      player.occupied[key] = true;
      player.pawns--;
      const gained = checkAlignment(player.occupied, event.cell);
      if (gained === 999) {
        player.score = 999;
      } else {
        player.score += gained;
      }

      return { players: updatedPlayers };
    }),
  },
  guards: {
    hasRollsLeft: ({ context }) => context.rollsLeft > 0,
    validCombination: ({ context, event }) =>
      event.type === "CHOOSE_COMBINATION" &&
      evaluateCombinations(context.dice).includes(event.combination),
    canUseYamPredator: ({ context, event }) =>
      event.type === "CHOOSE_COMBINATION" &&
      event.combination === "yam" &&
      evaluateCombinations(context.dice).includes("yam"),
  },
}).createMachine({
  id: "yamMaster",
  initial: "idle",
  context: {
    players: [
      {
        id: "player1",
        pawns: 12,
        board: { ...defaultBoard },
        score: 0,
        occupied: {},
      },
      {
        id: "player2",
        pawns: 12,
        board: { ...defaultBoard },
        score: 0,
        occupied: {},
      },
    ],
    currentPlayerIndex: 0,
    dice: [],
    keptDice: [],
    rollsLeft: 3,
    diceCount: 5,
  },
  states: {
    idle: {
      on: {
        START_GAME: {
          target: "playing",
          actions: assign(({ event }) => ({
            diceCount: event.type === "START_GAME" ? event.diceCount ?? 5 : 5,
            rollsLeft: 3,
            dice: [],
            keptDice: [],
            currentPlayerIndex: 0,
            players: [
              {
                id: "player1",
                pawns: 12,
                board: { ...defaultBoard },
                score: 0,
                occupied: {},
              },
              {
                id: "player2",
                pawns: 12,
                board: { ...defaultBoard },
                score: 0,
                occupied: {},
              },
            ],
          })),
        },
      },
    },

    playing: {
      initial: "playerTurn",
      states: {
        playerTurn: {
          initial: "start",
          states: {
            start: {
              entry: assign(() => ({
                rollsLeft: 3,
                dice: [],
                keptDice: [],
              })),
              always: "rollPhase",
            },
            rollPhase: {
              on: {
                ROLL: {
                  target: "rolling",
                  guard: "hasRollsLeft",
                  actions: assign(({ context }) => ({
                    rollsLeft: context.rollsLeft - 1,
                  })),
                },
              },
            },
            rolling: {
              entry: assign(({ context }) => ({
                dice: (() => {
                  const newRoll = rollDice(
                    context.diceCount - context.keptDice.length
                  );
                  return [...context.keptDice, ...newRoll];
                })(),
              })),
              always: "choosePhase",
            },
            choosePhase: {
              on: {
                KEEP: {
                  actions: assign(({ context, event }) => ({
                    keptDice:
                      event.type === "KEEP"
                        ? event.diceIndexes.map((i) => context.dice[i])
                        : context.keptDice,
                  })),
                },
                ROLL: {
                  target: "rolling",
                  guard: "hasRollsLeft",
                  actions: assign(({ context }) => ({
                    rollsLeft: context.rollsLeft - 1,
                  })),
                },
                CHOOSE_COMBINATION: [
                  {
                    target: "yamPredator",
                    guard: "canUseYamPredator",
                  },
                  {
                    target: "placePawn",
                    guard: "validCombination",
                    actions: assign(({ context, event }) => {
                      if (event.type !== "CHOOSE_COMBINATION") return {};
                      const players = [...context.players];
                      const cur = players[context.currentPlayerIndex];
                      const key = event.combination as Combination;
                      if (!cur.board[key]) {
                        cur.board[key] = true;
                        cur.pawns -= 1;
                      }
                      return { players };
                    }),
                  },
                ],
              },
            },
            yamPredator: {
              on: {
                USE_YAM_PREDATOR: {
                  target: "resolve",
                  actions: "placePawn",
                },
              },
            },
            placePawn: {
              on: {
                ACCEPT_COMBINATION: {
                  target: "resolve",
                  actions: "placePawn",
                },
              },
            },
            resolve: {
              always: "#yamMaster.playing.checkEnd",
            },
          },
        },

        checkEnd: {
          always: [
            {
              guard: ({ context }) =>
                context.players[context.currentPlayerIndex].score === 999,
              target: "gameOver",
            },
            {
              guard: ({ context }) =>
                context.players[context.currentPlayerIndex].pawns === 0,
              target: "gameOver",
            },
            { target: "switchPlayer" },
          ],
        },

        switchPlayer: {
          entry: assign(({ context }) => ({
            currentPlayerIndex: 1 - context.currentPlayerIndex,
          })),
          always: "playerTurn",
        },

        gameOver: {
          type: "final",
        },
      },
      onDone: "idle",
    },
  },
});
