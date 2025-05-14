// test/toggleMachine.test.ts
import { describe, it, expect } from 'vitest';
import { createMachine, createActor } from 'xstate';
import { getSimplePaths } from '@xstate/graph';

// 1. Définition de la machine
const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active:   { on: { TOGGLE: 'inactive' } }
  }
});

// 2. Tests Vitest
describe('toggleMachine (couverture manuelle)', () => {
  it('devrait couvrir tous les états possibles', () => {
    const paths = getSimplePaths(toggleMachine);
    // paths: { [JSON.stringify(state)]: { state, path } }
    const covered = new Set(
      Object.values(paths).map(({ state }) => state.value as string)
    );
    const allStates = Object.keys(toggleMachine.states);

    allStates.forEach((s) => {
      expect(covered.has(s)).toBe(true);
    });
  });

  it('démarre sur "inactive"', () => {
    const actor = createActor(toggleMachine).start();
    expect(actor.getSnapshot().value).toBe('inactive');
  });

  it('bascule sur "active" après TOGGLE', () => {
    const actor = createActor(toggleMachine).start();
    actor.send({ type: 'TOGGLE' });
    expect(actor.getSnapshot().value).toBe('active');
  });
});
