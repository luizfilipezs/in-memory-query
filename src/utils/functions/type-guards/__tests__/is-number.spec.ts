import { isNumber } from '../is-number';

describe('isNumber', () => {
  it('should return true for valid numbers', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(42)).toBe(true);
    expect(isNumber(-10)).toBe(true);
    expect(isNumber(3.14)).toBe(true);
    expect(isNumber(NaN)).toBe(true); // typeof NaN === 'number'
    expect(isNumber(Infinity)).toBe(true);
    expect(isNumber(-Infinity)).toBe(true);
  });

  it('should return false for non-number values', () => {
    expect(isNumber('123')).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
    expect(isNumber(true)).toBe(false);
    expect(isNumber(false)).toBe(false);
    expect(isNumber(() => 1)).toBe(false);
  });

  it('should narrow the type when returning true (type guard)', () => {
    const value: unknown = 123;

    if (isNumber(value)) {
      // If this compiles, the type guard works
      const result: number = value + 1;
      expect(result).toBe(124);
    } else {
      throw new Error('Expected value to be a number');
    }
  });
});
