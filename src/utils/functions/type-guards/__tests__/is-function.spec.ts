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

  it('should narrow the type when returning true (type guard)', () => {
    const value = () => 'hello';

    if (isFunction<() => string>(value)) {
      // If this compiles, the type guard works
      const result = value();
      expect(result).toBe('hello');
    } else {
      fail('Expected value to be a function');
    }
  });
});
