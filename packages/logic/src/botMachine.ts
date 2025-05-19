import { createMachine, assign, sendParent } from "xstate";
import { rollDice, evaluateCombinations } from "./utils";
import type { Player, Cell } from "./types";

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
      computeKeeps: assign(({context}) => {
        const combos = evaluateCombinations(context.dice);
        if (combos.includes("brelan")) {
          // fréquencier puis ne garder QUE les 3 premiers indices du brelan
          const freq = new Map<number, number>();
          context.dice.forEach((d) => freq.set(d, (freq.get(d) ?? 0) + 1));
          const [targetValue] =
            Array.from(freq.entries()).find(([, c]) => c >= 3) || [];
          const keptIndices = context.dice
            .map((d, i) => (d === targetValue ? i : -1))
            .filter((i) => i >= 0)
            .slice(0, 3);
          return { keptDice: keptIndices.map((i) => context.dice[i]) };
        }
        return { keptDice: [] };
      }),

      // choix de la combi finale et notification du parent
      chooseAndSendMove: sendParent(({context}) => {
        const [combo] = evaluateCombinations(context.dice);
        const cell: Cell = { x: 0, y: 0 }; // ou stratégie plus avancée
        return { type: "BOT_MOVE", combination: combo, cell }; // à adapter selon mapping réel
      }),
    },
    guards: {
      // tant qu'il reste des lancers, on repasse en choosing
      canRoll: ({ context }) => context.rollsLeft > 0,
    },
  }
);
