import { createMachine, assign } from "xstate";
import { rollDice, evaluateCombinations } from "./utils";
import type { Player, Combination, Cell } from "./types";

/**
 * Contexte interne du bot PVB
 */
export type BotContext = {
  board: Player[];
  diceCount: number;
  rollsLeft: number;
  dice: number[];
  keptDice: number[];
};

/**
 * Événement déclencheur unique du bot
 */
export type BotEvent = { type: "START_BOT"; board: Player[] };

/**
 * Machine XState pilotant l'IA en mode Players vs Bot
 */
export const botMachine = createMachine(
  {
    id: "bot",
    initial: "idle",
    types: {
      context: {} as BotContext,
      events: {} as BotEvent,
    },
    context: {
      board: [],
      diceCount: 5,
      rollsLeft: 3,
      dice: [],
      keptDice: [],
    },
    states: {
      idle: {
        on: {
          START_BOT: {
            target: "rolling",
            actions: "initContext",
          },
        },
      },
      rolling: {
        entry: "performRoll",
        always: [
          { target: "choosing", guard: "canRoll" },
          { target: "selectCombination" },
        ],
      },
      choosing: {
        entry: "computeKeeps",
        always: "rolling",
      },
      selectCombination: {
        entry: "chooseAndSendMove",
        type: "final",
      },
    },
  },
  {
    actions: {
      // initialisation du contexte à chaque START_BOT
      initContext: assign({
        board: ({ event }) => event.board,
        rollsLeft: () => 3,
        dice: () => [],
        keptDice: () => [],
      }),

      // lance les dés puis décrémente rollsLeft
      performRoll: assign({
        dice: ({ context }) => [
          ...context.keptDice,
          ...rollDice(context.diceCount - context.keptDice.length),
        ],
        rollsLeft: ({ context }) => context.rollsLeft - 1,
      }),

      // garde une simple heuristique : conserve un brelan si disponible
      computeKeeps: assign(({ context }) => {
        const combos = evaluateCombinations(context.dice);
        let keptIndices: number[] = [];
        if (combos.includes("brelan")) {
          const freq = new Map<number, number>();
          context.dice.forEach((d) => freq.set(d, (freq.get(d) ?? 0) + 1));
          const [targetValue] =
            Array.from(freq.entries()).find(([, c]) => c >= 3) || [];
          keptIndices = context.dice
            .map((d, i) => (d === targetValue ? i : -1))
            .filter((i) => i >= 0);
        }
        return { keptDice: keptIndices.map((i) => context.dice[i]) };
      }),

      // choix de la combi finale et notification du parent
      chooseAndSendMove: ({ context }) => {
        const combos = evaluateCombinations(context.dice);
        const combo: Combination = combos[0]; // ou stratégie plus avancée
        const cell: Cell = { x: 0, y: 0 }; // à adapter selon mapping réel
        // @ts-expect-error: envoi interne XState
        context.__sendParent({ type: "BOT_MOVE", combination: combo, cell });
      },
    },
    guards: {
      // tant qu'il reste des lancers, on repasse en choosing
      canRoll: ({ context }) => context.rollsLeft > 0,
    },
  }
);
