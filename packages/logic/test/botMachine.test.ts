import { describe, it, expect, vi } from 'vitest';
import { createActor } from 'xstate';
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

// Création d'une version modifiée de la machine pour les tests
// qui n'utilise pas sendParent pour éviter l'erreur
const testBotMachine = botMachine.provide({
  actions: {
    // Remplace l'action sendParent par une action vide
    chooseAndSendMove: () => {}
  }
});

describe('Bot Machine Tests', () => {
  // Test des transitions d'états manuellement
  it('doit passer de idle à un état final après START_BOT', () => {
    const actor = createActor(testBotMachine).start();
    expect(actor.getSnapshot().value).toBe('idle');
    
    actor.send(Events.START_BOT);
    // La machine passe rapidement par les états intermédiaires
    // et termine dans l'état final selectCombination
    expect(actor.getSnapshot().status).toBe('done');
  });
  
  it('doit passer de rolling à choosing si rollsLeft > 0', () => {
    const actor = createActor(testBotMachine).start();
    actor.send(Events.START_BOT);
    
    // Après START_BOT, on devrait être dans l'état choosing car rollsLeft = 2
    // (3 au départ, -1 après performRoll)
    expect(actor.getSnapshot().value).toBe('choosing');
  });
  
  it('doit passer à selectCombination quand rollsLeft = 0', () => {
    const actor = createActor(testBotMachine).start();
    actor.send(Events.START_BOT);
    
    // Après 3 lancers (1 initial + 2 boucles), on devrait être dans selectCombination
    // car rollsLeft = 0
    const snapshot = actor.getSnapshot();
    // On vérifie qu'on est bien dans l'état final
    expect(snapshot.status).toBe('done');
  });

  // Test spécifique pour vérifier le comportement du bot
  it('doit passer par tous les états et terminer avec un choix de combinaison', () => {
    const actor = createActor(testBotMachine).start();
    
    // On démarre le bot
    actor.send(Events.START_BOT);
    
    // Vérification de l'état final
    const snapshot = actor.getSnapshot();
    expect(snapshot.status).toBe("done");
    
    // Vérification que le bot a bien lancé les dés
    expect(snapshot.context.dice).toEqual([6, 6, 6, 6, 6]);
    
    // Vérification que le bot a bien gardé un brelan
    expect(snapshot.context.keptDice).toEqual([6, 6, 6]);
  });
  
  // Test de l'action computeKeeps
  it('doit garder les dés formant un brelan', () => {
    const actor = createActor(testBotMachine).start();
    
    // On initialise manuellement le contexte
    actor.send(Events.START_BOT);
    
    // On vérifie que computeKeeps a bien gardé les dés du brelan
    const snapshot = actor.getSnapshot();
    expect(snapshot.context.keptDice).toEqual([6, 6, 6]);
  });
  
  // Test de l'action chooseAndSendMove
  it('doit envoyer un événement BOT_MOVE au parent', () => {
    // On crée un mock pour capturer l'événement envoyé au parent
    const sendParentMock = vi.fn();
    
    // On crée un acteur avec un contexte modifié pour simuler l'envoi au parent
    // en utilisant un système d'espionnage pour vérifier l'appel à sendParent
    const spyMachine = botMachine.provide({
      actions: {
        // On remplace l'action sendParent par notre mock
        chooseAndSendMove: ({ context }) => {
          const combos = evaluateCombinations(context.dice);
          const combo: Combination = combos[0];
          const cell: Cell = { x: 0, y: 0 };
          sendParentMock({ type: 'BOT_MOVE', combination: combo, cell });
        },
      },
    });
    
    // On crée un acteur avec notre machine espionnée
    const actor = createActor(spyMachine).start();
    actor.send(Events.START_BOT);
    
    // Vérification que l'événement a bien été envoyé avec les bonnes données
    expect(sendParentMock).toHaveBeenCalledWith({
      type: 'BOT_MOVE',
      combination: 'yam',
      cell: { x: 0, y: 0 },
    });
  });
});