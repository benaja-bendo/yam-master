import { createMachine } from 'xstate';

export const gameMachine = createMachine({
  id: 'game',
  initial: 'waiting',
  states: {
    waiting: {
      on: { START: 'playing' }
    },
    playing: {
      on: { END: 'finished' }
    },
    finished: {
      type: 'final'
    }
  }
});
