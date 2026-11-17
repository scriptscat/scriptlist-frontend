import { describe, expect, it } from 'vitest';
import { scoreToRating } from './utils';

describe('scoreToRating', () => {
  it.each([
    [10, 1],
    [40, 4],
    [50, 5],
  ])('converts backend score %i to %i stars', (score, rating) => {
    expect(scoreToRating(score)).toBe(rating);
  });
});
