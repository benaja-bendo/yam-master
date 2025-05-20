import { createMachine, assign } from "xstate";
import { rollDice, evaluateCombinations } from "./utils";
import { checkAlignment, applyYamPredator, defaultPlayers } from "./board";
import type { GameContext, GameEvent } from "./types";

// initial context
const initialContext: GameContext = {
  mode: "pvp",
  botDifficulty: undefined,
  players: defaultPlayers(),
  currentPlayerIndex: 0,
  diceCount: 5,
  dice: [],
  keptDice: [],
  rollsLeft: 3,
};

export const gameMachine = createMachine(
  {
    id: "yamMaster",
    initial: "idle",
    types: {
      events: {} as GameEvent,
      context: {} as GameContext,
    },
    context: initialContext,
    states: {
      // État initial : on attend la demande de création de partie
      idle: {
        on: {
          START_GAME: {
            target: "setup",
            actions: assign({
              mode: ({event}) => event.mode,
              botDifficulty: ({event}) =>
                event.mode === "pvb" ? event.botDifficulty : undefined,
              diceCount: ({event}) => event.diceCount ?? 5,
            }),
          },
        },
      },

      // Selon le mode, on attend un second joueur ou on entre directement en jeu
      setup: {
        // Initialisation des joueurs et de l'index
        entry: assign({
          // Initialisation des joueurs et de l'index
          players: () => defaultPlayers(),
          currentPlayerIndex: () => 0,
        }),
        always: [
          { target: "waiting", guard: "isPVP" },
          { target: "playing", guard: "isPVB" },
        ],
      },

      // PvP uniquement : on attend que le joueur2 envoie JOIN
      waiting: {
        on: {
          JOIN: {
            target: "playing",
            guard: ({ event }) =>
              event.type === "JOIN" && event.playerId === "player2",
          },
        },
      },

      // Boucle de jeu (PvP ou PvB)
      playing: {
        initial: "playerTurn",
        states: {
          playerTurn: {
            initial: "start",
            states: {
              start: {
                entry: "resetRolls",
                always: { target: "rollPhase" },
              },
              rollPhase: {
                on: {
                  ROLL: {
                    target: "rolling",
                    guard: "hasRollsLeft",
                    actions: "decrementRolls",
                  },
                },
              },
              rolling: {
                entry: "doRoll",
                always: { target: "choosePhase" },
              },
              choosePhase: {
                on: {
                  KEEP: {
                    actions: "doKeep",
                  },
                  ROLL: {
                    target: "rolling",
                    guard: "hasRollsLeft",
                    actions: "decrementRolls",
                  },
                  CHOOSE_COMBINATION: [
                    {
                      target: "yamPredator",
                      guard: "canUseYamPredator",
                    },
                    {
                      target: "placePawn",
                      guard: "validCombination",
                      actions: "markCombinationOnBoard",
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
                always: { target: "#yamMaster.playing.checkEnd" },
              },
            },
          },

          checkEnd: {
            always: [
              {
                guard: "hasInstantWin",
                target: "#yamMaster.gameOver",
              },
              {
                guard: "hasNoPawnsLeft",
                target: "#yamMaster.gameOver",
              },
              { target: "switchPlayer" },
            ],
          },

          switchPlayer: {
            entry: "advancePlayer",
            always: { target: "playerTurn" },
          },
        },
      },

      // État terminal explicite (ne renvoie plus automatiquement en idle)
      gameOver: {
        type: "final",
      },
    },
  },
  {
    actions: {
      // Roll logic
      resetRolls: assign({
        rollsLeft: 3,
        dice: [],
        keptDice: [],
      }),
      decrementRolls: assign({
        rollsLeft: ({ context }) => context.rollsLeft - 1,
      }),
      doRoll: assign({
        dice: ({ context }) => [
          ...context.keptDice,
          ...rollDice(context.diceCount - context.keptDice.length),
        ],
      }),
      doKeep: assign({
        keptDice: ({ context, event }) =>
          event.type === "KEEP"
            ? event.diceIndexes.map((i) => context.dice[i])
            : context.keptDice,
      }),

      // Marquage de la combinaison sur le plateau (avant l'accept)
      markCombinationOnBoard: assign({
        players: ({ context, event }) => {
          if (event.type !== "CHOOSE_COMBINATION") return context.players;
          const players = [...context.players];
          const cur = players[context.currentPlayerIndex];
          if (!cur.board[event.combination]) {
            cur.board[event.combination] = true;
            cur.pawns -= 1;
          }
          return players;
        },
      }),

      // Pose du pion et calcul des points
      placePawn: assign({
        players: ({ context, event }) => {
          if (
            event.type !== "ACCEPT_COMBINATION" &&
            event.type !== "USE_YAM_PREDATOR"
          ) {
            return context.players;
          }
          let players = context.players.map((p) => ({ ...p }));
          if (event.type === "USE_YAM_PREDATOR") {
            players = applyYamPredator(
              players,
              context.currentPlayerIndex,
              event.cell
            );
          } else {
            const cur = players[context.currentPlayerIndex];
            const key = `${event.cell.x}:${event.cell.y}`;
            if (!cur.occupied[key]) {
              cur.occupied[key] = true;
              cur.pawns--;
              const pts = checkAlignment(cur.occupied, event.cell);
              cur.score = pts === 999 ? 999 : cur.score + pts;
            }
          }
          return players;
        },
      }),

      // Switch player index
      advancePlayer: assign({
        currentPlayerIndex: ({ context }) => 1 - context.currentPlayerIndex,
      }),
    },
    guards: {
      isPVP: ({ context }) => context.mode === "pvp",
      isPVB: ({ context }) => context.mode === "pvb",
      hasRollsLeft: ({ context }) => context.rollsLeft > 0,
      validCombination: ({ context, event }) =>
        event.type === "CHOOSE_COMBINATION" &&
        evaluateCombinations(context.dice).includes(event.combination),
      canUseYamPredator: ({ context, event }) =>
        event.type === "CHOOSE_COMBINATION" &&
        event.combination === "yam" &&
        evaluateCombinations(context.dice).includes("yam"),
      hasInstantWin: ({ context }) =>
        context.players[context.currentPlayerIndex].score === 999,
      hasNoPawnsLeft: ({ context }) =>
        context.players[context.currentPlayerIndex].pawns === 0,
    },
  }
);
