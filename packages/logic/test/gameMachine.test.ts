// tests/gameMachine.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createActor } from 'xstate';
import { getShortestPaths } from '@xstate/graph';
import { gameMachine } from '../src/gameMachine';
import type { GameEvent, Cell, Combination } from '../src/types';

// ---- 1. Mock déterministe ----
// rollDice renvoie toujours [6,6,6,6,6]
// evaluateCombinations renvoie à la fois 'yam' et 'brelan'
vi.mock('../src/utils', () => ({
  rollDice: (_count: number) => [6, 6, 6, 6, 6],
  evaluateCombinations: () => ['yam', 'brelan'] as Combination[],
}));

// ---- 2. Événements réutilisables ----
const Events = {
  START:        { type: 'START_GAME'    as const, diceCount: 5 },
  ROLL:         { type: 'ROLL'          as const      },
  KEEP:         { type: 'KEEP'          as const, diceIndexes: [0] },
  CHOOSE_YAM:   { type: 'CHOOSE_COMBINATION' as const, combination: 'yam'    as const, cell: { x: 0, y: 0 } as Cell },
  CHOOSE_BRELAN:{ type: 'CHOOSE_COMBINATION' as const, combination: 'brelan' as const, cell: { x: 0, y: 0 } as Cell },
  USE_PREDATOR: { type: 'USE_YAM_PREDATOR'   as const, cell: { x: 0, y:  0 } as Cell },
  ACCEPT:       { type: 'ACCEPT_COMBINATION' as const, cell: { x: 0, y:  0 } as Cell },
};

// ---- 3. Calcul des plus courts chemins statiques ----
const shortestPaths = getShortestPaths(gameMachine, {
  events: [
    Events.START,
    Events.ROLL,
    Events.KEEP,
    Events.CHOOSE_YAM,
    Events.USE_PREDATOR,
    Events.ACCEPT,
  ],
});

describe('Game Machine – XState Graph Tests', () => {
  // 4. Boucle sur tous les chemins, n'envoyant que les steps du chemin
  shortestPaths.forEach((path) => {
    it(
      `Atteint ${JSON.stringify(path.state.value)} via ${path.steps
        .map((s) => s.event.type)
        .join(' → ') || 'xstate.init'}`,
      () => {
        const actor = createActor(gameMachine).start();
        // On n'envoie QUE les events de path.steps, ni plus ni moins
        path.steps.forEach((step) => actor.send(step.event as GameEvent));

        const snapshot = actor.getSnapshot();
        // On compare la valeur d'état brute
        expect(snapshot.value).toEqual(path.state.value);
      }
    );
  });

  // 5. Test spécifique pour la condition de victoire (alignement 5)
  it('doit entrer en gameOver quand on complète un alignement de 5 pions', () => {
    const actor = createActor(gameMachine).start();
    // On démarre la partie
    actor.send(Events.START);

    // On pré-remplit 4 pions alignés verticalement pour le player1
    const snap1 = actor.getSnapshot();
    snap1.context.players[0].occupied = {
      '0:1': true,
      '0:2': true,
      '0:3': true,
      '0:4': true,
    };
    expect(snap1.context.currentPlayerIndex).toBe(0);

    // On lance, on choisit 'brelan' (branch placePawn) et on accepte pour poser le 5ᵉ pion
    actor.send(Events.ROLL);
    actor.send(Events.CHOOSE_BRELAN);
    actor.send(Events.ACCEPT);

    const snap2 = actor.getSnapshot();
    // Vérifie qu'on est bien dans playing.gameOver
    expect(snap2.matches({ playing: 'gameOver' })).toBe(true);
    // Et le score vaut bien 999 (alignement 5)
    expect(snap2.context.players[0].score).toBe(999);
  });
});
