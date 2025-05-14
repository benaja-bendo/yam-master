import { createMachine, interpret } from 'xstate';
import { test, expect, describe } from 'vitest';

// Définition de la machine
const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active:   { on: { TOGGLE: 'inactive' } }
  }
});

describe('toggleMachine', () => {
  test('devrait démarrer sur "inactive" et basculer correctement', () => {
    // Arrange
    const service = interpret(toggleMachine).start();
    expect(service.getSnapshot().value).toBe('inactive');

    // Act & Assert: inactive → active
    service.send({ type: 'TOGGLE' });
    expect(service.getSnapshot().value).toBe('active');

    // Act & Assert: active → inactive
    service.send({ type: 'TOGGLE' });
    expect(service.getSnapshot().value).toBe('inactive');
  });
});
