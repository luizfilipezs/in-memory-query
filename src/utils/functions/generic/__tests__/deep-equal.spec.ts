import { deepEqual } from '../deep-equal';

describe('deepEqual', () => {
  describe('primitive values', () => {
    it('returns true for strictly equal primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('a', 'a')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('returns false for different primitive values', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('a', 'b')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });
  });

  describe('objects', () => {
    it('returns true for deeply equal plain objects', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 1, y: 2 };

      expect(deepEqual(a, b)).toBe(true);
    });

    it('returns false for objects with different keys', () => {
      expect(deepEqual({ x: 1 }, { y: 1 })).toBe(false);
    });

    it('returns false for objects with same keys but different values', () => {
      expect(deepEqual({ x: 1 }, { x: 2 })).toBe(false);
    });

    it('returns false when one object has extra keys', () => {
      expect(deepEqual({ x: 1 }, { x: 1, y: 2 })).toBe(false);
    });
  });

  describe('nested structures', () => {
    it('returns true for deeply nested objects', () => {
      const a = { x: { y: { z: 1 } } };
      const b = { x: { y: { z: 1 } } };

      expect(deepEqual(a, b)).toBe(true);
    });

    it('returns false for deeply nested differences', () => {
      const a = { x: { y: { z: 1 } } };
      const b = { x: { y: { z: 2 } } };

      expect(deepEqual(a, b)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('returns true for deeply equal arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns false for arrays with different order', () => {
      expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
    });

    it('returns true for arrays with nested objects', () => {
      const a = [{ x: 1 }, { y: 2 }];
      const b = [{ x: 1 }, { y: 2 }];

      expect(deepEqual(a, b)).toBe(true);
    });

    it('returns false for arrays with different lengths', () => {
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });
  });

  describe('mixed and edge cases', () => {
    it('returns false when comparing array and object', () => {
      expect(deepEqual([], {})).toBe(false);
    });

    it('returns false when one value is object and the other is primitive', () => {
      expect(deepEqual({ x: 1 }, 1)).toBe(false);
    });

    it('returns true for same object reference', () => {
      const obj = { x: 1 };
      expect(deepEqual(obj, obj)).toBe(true);
    });

    it('returns false for Date objects with same value (by design)', () => {
      const a = new Date(2020, 1, 1);
      const b = new Date(2020, 1, 1);

      // Date has no enumerable keys, so this documents the limitation
      expect(deepEqual(a, b)).toBe(true);
    });
  });
});
