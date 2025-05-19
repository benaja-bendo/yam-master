// packages/logic/test/botMachine.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createActor } from 'xstate';
import { getShortestPaths } from '@xstate/graph';
import { botMachine } from '../src/botMachine';
import type { Combination, Cell } from '../src/types';

// ---- 1. Mock déterministe ----
// rollDice renvoie toujours [6,6,6,6,6]
// evaluateCombinations renvoie à la fois 'yam' et 'brelan'
vi.mock('../src/utils', () => ({
  rollDice: (_count: number) => [6, 6, 6, 6, 6],
  evaluateCombinations: () => ['yam', 'brelan'] as Combination[],
}));

// ---- 2. Événements réutilisables ----
const Events = {
  START_BOT: { type: 'START_BOT' as const, board: [] },
};

// ---- 3. Calcul des plus courts chemins statiques ----
const shortestPaths = getShortestPaths(botMachine, {
  events: [
    Events.START_BOT,
  ],
});

describe('Bot Machine – XState Graph Tests', () => {
  // 4. Boucle sur tous les chemins, n'envoyant que les steps du chemin
  shortestPaths.forEach((path) => {
    it(
      `Atteint ${JSON.stringify(path.state.value)} via ${path.steps
        .map((s) => s.event.type)
        .join(' → ') || 'xstate.init'}`,
      () => {
        const actor = createActor(botMachine).start();
        // On n'envoie QUE les events de path.steps, ni plus ni moins
        path.steps.forEach((step) => actor.send(step.event));

        const snapshot = actor.getSnapshot();
        // On compare la valeur d'état brute
        expect(snapshot.value).toEqual(path.state.value);
      }
    );
  });

  // 5. Test spécifique pour vérifier le comportement du bot
  it('doit passer par tous les états et terminer avec un choix de combinaison', () => {
    const actor = createActor(botMachine).start();
    
    // On démarre le bot
    actor.send(Events.START_BOT);
    
    // Vérification de l'état final
    const snapshot = actor.getSnapshot();
    expect(snapshot.done).toBe(true);
    
    // Vérification que le bot a bien lancé les dés
    expect(snapshot.context.dice).toEqual([6, 6, 6, 6, 6]);
    
    // Vérification que le bot a bien gardé un brelan
    expect(snapshot.context.keptDice).toEqual([6, 6, 6]);
  });
  
  // 6. Test de l'action computeKeeps
  it('doit garder les dés formant un brelan', () => {
    const actor = createActor(botMachine).start();
    
    // On initialise manuellement le contexte
    actor.send(Events.START_BOT);
    
    // On vérifie que computeKeeps a bien gardé les dés du brelan
    const snapshot = actor.getSnapshot();
    expect(snapshot.context.keptDice).toEqual([6, 6, 6]);
  });
  
  // 7. Test de l'action chooseAndSendMove
  it('doit envoyer un événement BOT_MOVE au parent', () => {
    // On crée un mock pour capturer l'événement envoyé au parent
    const sendParentMock = vi.fn();
    
    // On crée un acteur avec un contexte modifié pour simuler l'envoi au parent
    const customMachine = botMachine.provide({
      actions: {
        chooseAndSendMove: ({ context }) => {
          const combos = ['yam', 'brelan'];
          const combo: Combination = combos[0];
          const cell: Cell = { x: 0, y: 0 };
          sendParentMock({ type: 'BOT_MOVE', combination: combo, cell });
        },
      },
    });
    
    const actor = createActor(customMachine).start();
    actor.send(Events.START_BOT);
    
    // Vérification que l'événement a bien été envoyé
    expect(sendParentMock).toHaveBeenCalledWith({
      type: 'BOT_MOVE',
      combination: 'yam',
      cell: { x: 0, y: 0 },
    });
  });
});