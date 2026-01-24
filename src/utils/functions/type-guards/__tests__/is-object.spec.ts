import { isObject } from '../is-object';

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject(Object.create(null))).toBe(true);
  });

  it('should return true for non-plain objects (by design)', () => {
    expect(isObject([])).toBe(true); // arrays are objects
    expect(isObject(new Date())).toBe(true); // Date is an object
    expect(isObject(/regex/)).toBe(true); // RegExp is an object
    expect(isObject(new Map())).toBe(true);
    expect(isObject(new Set())).toBe(true);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
    expect(isObject(() => {})).toBe(false); // functions are not objects
  });

  it('should narrow the type when returning true (type guard)', () => {
    const value: unknown = { a: 1 };

    if (isObject(value)) {
      // TypeScript now knows value is object
      expect(typeof value).toBe('object');
    } else {
      fail('Expected value to be an object');
    }
  });
});
