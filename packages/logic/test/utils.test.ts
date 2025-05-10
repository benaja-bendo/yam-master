import { describe, it, expect } from 'vitest';
import { rollDice, evaluateCombinations } from '../src/utils';

describe('rollDice', () => {
  it('devrait retourner un tableau de la bonne longueur', () => {
    const result = rollDice(5);
    expect(result).toHaveLength(5);
  });

  it('devrait retourner des valeurs entre 1 et 6', () => {
    const result = rollDice(10);
    result.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    });
  });
});

describe('evaluateCombinations', () => {
  it('devrait détecter un brelan', () => {
    expect(evaluateCombinations([1, 1, 1, 2, 3])).toContain('brelan');
  });

  it('devrait détecter un carré', () => {
    expect(evaluateCombinations([1, 1, 1, 1, 2])).toContain('carre');
  });

  it('devrait détecter un yam', () => {
    expect(evaluateCombinations([1, 1, 1, 1, 1])).toContain('yam');
  });

  it('devrait détecter un full', () => {
    expect(evaluateCombinations([1, 1, 1, 2, 2])).toContain('full');
  });

  it('devrait détecter une suite', () => {
    expect(evaluateCombinations([1, 2, 3, 4, 5])).toContain('suite');
    expect(evaluateCombinations([2, 3, 4, 5, 6])).toContain('suite');
  });

  it('devrait détecter une somme <= 8', () => {
    expect(evaluateCombinations([1, 1, 1, 2, 2])).toContain('sum<=8');
  });

  it('devrait retourner plusieurs combinaisons possibles', () => {
    const result = evaluateCombinations([1, 1, 1, 1, 1]);
    expect(result).toContain('brelan');
    expect(result).toContain('carre');
    expect(result).toContain('yam');
  });

  it('ne devrait pas détecter de combinaisons invalides', () => {
    const result = evaluateCombinations([1, 2, 3, 4, 6]);
    expect(result).not.toContain('brelan');
    expect(result).not.toContain('full');
    expect(result).not.toContain('suite');
  });
});