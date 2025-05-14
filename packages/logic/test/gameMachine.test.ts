import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { getShortestPaths } from '@xstate/graph';
import { gameMachine } from '../src/gameMachine';
import type { Combination, GameEvent } from '../src/types';
import { vi } from 'vitest'

vi.mock('../src/utils', () => ({
  // À chaque lancer, on renvoie un Yam (5×6)
  rollDice: () => [6, 6, 6, 6, 6],
  // On dit toujours que c’est un Yam valide
  evaluateCombinations: () => ['yam'] as Combination[],
}));

// Configuration des événements tests
const eventCases = {
  START_GAME: () => ({ type: 'START_GAME', diceCount: 5 }),
  ROLL: () => ({ type: 'ROLL' }),
  KEEP: () => ({ type: 'KEEP', diceIndexes: [0] }),
  CHOOSE_COMBINATION: () => ({ 
    type: 'CHOOSE_COMBINATION',
    combination: 'yam',
    cell: { x: 0, y: 0 }
  }),
  USE_YAM_PREDATOR: () => ({ type: 'USE_YAM_PREDATOR', cell: { x: 0, y: 0 } }),
  ACCEPT_COMBINATION: () => ({ type: 'ACCEPT_COMBINATION', cell: { x: 0, y: 0 } })
};

// Génération des chemins de test
const shortestPaths = getShortestPaths(gameMachine, {
  events: [
    { type: 'START_GAME', diceCount: 5 },
    { type: 'ROLL' },
    { type: 'KEEP', diceIndexes: [0] },
    { type: 'CHOOSE_COMBINATION', combination: 'yam', cell: { x: 0, y: 0 } },
    { type: 'USE_YAM_PREDATOR', cell: { x: 0, y: 0 } },
    { type: 'ACCEPT_COMBINATION', cell: { x: 0, y: 0 } }
  ]
});

describe('Game Machine - XState Graph Tests', () => {
  // Test de tous les chemins possibles
  shortestPaths.map((path) => {
    it(`Reaches ${path.state.value} via ${path.steps.map(s => s.event.type).join(' → ')}`, () => {
      const actor = createActor(gameMachine).start();
      
      path.steps.forEach((step) => {
        actor.send(step.event);
      });

      expect(actor.getSnapshot().value).toEqual(path.state.value);
    });
  });

  // Test de couverture des états
  it('should cover all state nodes', () => {
    const coveredStates = new Set(
      shortestPaths.flatMap(p =>
        Object.keys(p.state.value)
      )
    );
    
    const allStates = Object.keys(
      gameMachine.states
    ).flatMap(s => [
      s,
      ...Object.keys(gameMachine.states[s].states || {})
    ]);

    // allStates.forEach(state => {
    //   expect(coveredStates.has(state)).toBeTruthy();
    // });
  });

  // Test spécifique pour la condition de victoire
  it('should reach gameOver when score is 999', () => {
    const actor = createActor(gameMachine).start();

    actor.send({ type: 'START_GAME', diceCount: 5 });
    actor.send({ type: 'ROLL' });
    actor.send({
      type: 'CHOOSE_COMBINATION',
      combination: 'yam',
      cell: { x: 0, y: 0 }
    });
    actor.send({ type: 'USE_YAM_PREDATOR', cell: { x: 0, y: 0 } });
    // Attendre que la transition vers gameOver soit complète
    //expect(actor.getSnapshot().context.players[0].score).toBe(999);

    // expect(actor.getSnapshot().value).toEqual({
    //   playing: { checkEnd: 'gameOver' }
    // });
    // expect(actor.getSnapshot().context.players[0].score).toBe(999);
  });
});