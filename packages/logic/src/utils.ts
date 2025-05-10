import { Combination } from './types';
/**
 * Lance `n` dés (valeurs 1 à 6).
 */
export function rollDice(n: number): number[] {
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6));
}

/**
 * Évalue les combinaisons réalisables sur une main de dés.
 */
export function evaluateCombinations(dice: number[]): Combination[] {
  const counts = new Map<number, number>();
  dice.forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1));
  const freqs = Array.from(counts.values()).sort((a, b) => b - a);
  const sum = dice.reduce((a, b) => a + b, 0);
  const combos: Combination[] = [];

  // Brelan, Carré, Yam
  if (freqs[0] >= 3) combos.push('brelan');
  if (freqs[0] >= 4) combos.push('carre');
  if (freqs[0] === 5) combos.push('yam');

  // Full
  if (freqs[0] === 3 && freqs[1] === 2) combos.push('full');

  // Suite
  const uniq = Array.from(new Set(dice)).sort((a, b) => a - b).join(',');
  if (uniq === '1,2,3,4,5' || uniq === '2,3,4,5,6') combos.push('suite');

  // ≤8
  if (sum <= 8) combos.push('sum<=8');

  // sec et défi gérés dans la machine
  return combos;
}
