import { isFunction } from '../is-function';

describe('isFunction', () => {
  it('should return true for regular functions', () => {
    const fn = () => {};
    expect(isFunction(fn)).toBe(true);
  });

  it('should return true for async functions', () => {
    const fn = async () => {};
    expect(isFunction(fn)).toBe(true);
  });

  it('should return true for class constructors', () => {
    class Test {}
    expect(isFunction(Test)).toBe(true);
  });

  it('should return false for non-function values', () => {
    expect(isFunction(123)).toBe(false);
    expect(isFunction('string')).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction(true)).toBe(false);
  });
});
