import { createModel } from '@xstate/test';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createActor } from 'xstate';
import * as utils from '../src/utils';
import { gameMachine } from '../src/gameMachine';
import { defaultBoard, GameContext } from '../src/types';

describe('gameMachine', () => {
  const testModel = createModel(gameMachine).withEvents({
    START_GAME: {
      cases: [
        { diceCount: 3 },
        { diceCount: 5 }
      ]
    },
    ROLL: {},
    KEEP: {
      cases: [
        { diceIndexes: [0, 2] },
        { diceIndexes: [1, 3, 4] }
      ]
    },
    CHOOSE_COMBINATION: {
      cases: [
        { combination: 'brelan' },
        { combination: 'yam' }
      ]
    },
    USE_YAM_PREDATOR: {
      cases: [
        { cell: { x: 0, y: 0 } }
      ]
    }
  });

  const testPlans = testModel.getSimplePathPlans();

  beforeEach(() => {
    vi.spyOn(utils, 'rollDice').mockReturnValue([1, 2, 3, 4, 5]);
    vi.spyOn(utils, 'evaluateCombinations').mockReturnValue(['brelan']);
  });

  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      plan.paths.forEach((path) => {
        it(path.description, async () => {
          // Utilisation de createActor au lieu de interpret
          const actor = createActor(gameMachine).start();

          // Test des états
          await path.test(actor);

          // Vérifications spécifiques selon l'état final
          const snapshot = actor.getSnapshot();
          
          switch (snapshot.value) {
            case 'idle':
              expect(snapshot.context.rollsLeft).toBe(3);
              break;

            case { playing: 'playerTurn' }:
              expect(snapshot.context.currentPlayerIndex).toBeDefined();
              expect(snapshot.context.dice).toBeDefined();
              break;

            case { playing: 'gameOver' }:
              const winner = snapshot.context.players.find(p => p.pawns === 0 || p.score >= 999);
              expect(winner).toBeDefined();
              break;
          }
        });
      });
    });
  });

  // Tests spécifiques pour les invariants
  it('devrait toujours avoir un nombre valide de dés', () => {
    testModel.testInvariant(actor => {
      const { diceCount, dice } = actor.getSnapshot().context;
      expect(dice?.length).toBeLessThanOrEqual(diceCount);
    });
  });

  it('devrait toujours avoir un nombre valide de pions par joueur', () => {
    testModel.testInvariant(actor => {
      const { players } = actor.getSnapshot().context;
      players.forEach(player => {
        expect(player.pawns).toBeGreaterThanOrEqual(0);
        expect(player.pawns).toBeLessThanOrEqual(12);
      });
    });
  });
});
