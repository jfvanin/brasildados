import { describe, expect, it } from 'vitest';
import { decodeStateFromParams, encodeStateToParams, sanitizeYearRange } from './urlState';

describe('dashboard URL state', () => {
  const bounds = { startYear: 1990, endYear: 2025 };
  const fallback = { startYear: 2000, endYear: 2025 };

  it('round-trips the public query parameters', () => {
    const range = { startYear: 2005, endYear: 2020 };
    expect(decodeStateFromParams(encodeStateToParams(range).toString()).yearRange).toEqual(range);
  });

  it('clamps years to the dataset bounds', () => {
    expect(sanitizeYearRange({ startYear: 1900, endYear: 2100 }, fallback, bounds)).toEqual(bounds);
  });

  it('normalizes an inverted range', () => {
    expect(sanitizeYearRange({ startYear: 2020, endYear: 2005 }, fallback, bounds)).toEqual({ startYear: 2005, endYear: 2020 });
  });

  it('uses the default for missing values', () => {
    expect(sanitizeYearRange({}, fallback, bounds)).toEqual(fallback);
  });
});
