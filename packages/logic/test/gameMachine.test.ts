import { describe, it, expect, vi } from 'vitest';
import { createActor } from 'xstate';
import { getShortestPaths } from '@xstate/graph';
import { gameMachine } from '../src/gameMachine';
import type { GameEvent, Cell, Combination } from '../src/types';

// ---- 1. Mock déterministe pour toujours obtenir un Yam ----
vi.mock('../src/utils', () => ({
  rollDice: (_count: number) => [6, 6, 6, 6, 6],
  evaluateCombinations: () => ['yam'] as Combination[],
}));

// ---- 2. Définition des événements réutilisables ----
const Events = {
  START:        { type: 'START_GAME' as const, diceCount: 5 },
  ROLL:         { type: 'ROLL' as const },
  KEEP:         { type: 'KEEP' as const, diceIndexes: [0] },
  CHOOSE_YAM:   { type: 'CHOOSE_COMBINATION' as const, combination: 'yam' as const, cell: { x: 0, y: 0 } as Cell },
  USE_PREDATOR: { type: 'USE_YAM_PREDATOR' as const, cell: { x: 0, y: 0 } as Cell },
  ACCEPT:       { type: 'ACCEPT_COMBINATION' as const, cell: { x: 0, y: 0 } as Cell },
};

// ---- 3. Construction des plus courts chemins statiques ----
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
  // 4. Test de tous les chemins statiques
  shortestPaths.forEach((path) => {
    it(
      `Atteint ${JSON.stringify(path.state.value)} via ${path.steps
        .map((s) => s.event.type)
        .join(' → ')}`,
      () => {
        const actor = createActor(gameMachine).start();
        actor.send(Events.START);
        path.steps.forEach((step) => actor.send(step.event));
        const snapshot = actor.getSnapshot();

        // On compare directement la valeur de l'état
        expect(snapshot.value).toEqual(path.state.value);
      }
    );
  });

  // 5. Test de la victoire par alignement de 5 pions
  it('doit entrer en gameOver quand on complète un alignement de 5 pions', () => {
    const actor = createActor(gameMachine).start();
    actor.send(Events.START);

    // Pré-remplir 4 pions alignés verticalement pour player1
    const snap1 = actor.getSnapshot();
    snap1.context.players[0].occupied = {
      '0:1': true,
      '0:2': true,
      '0:3': true,
      '0:4': true,
    };

    // On reste bien sur le tour du player1
    expect(snap1.context.currentPlayerIndex).toBe(0);

    // Lancer, choix du Yam et pose du 5ᵉ pion
    actor.send(Events.ROLL);
    actor.send(Events.CHOOSE_YAM);
    actor.send(Events.ACCEPT);

    const snap2 = actor.getSnapshot();
    // Vérifie qu'on est dans playing.gameOver
    expect(snap2.matches({ playing: 'gameOver' })).toBe(true);
    // Le score passe à 999 (victoire immédiate)
    expect(snap2.context.players[0].score).toBe(999);
  });
});
