import { sortValues } from '../sort-values';

type SortOrder = 1 | -1;

describe('sortValues', () => {
  const ASC: SortOrder = 1;
  const DESC: SortOrder = -1;

  describe('nullish values', () => {
    it('should return 0 when both values are null', () => {
      expect(sortValues(null, null, ASC)).toBe(0);
      expect(sortValues(undefined, undefined, ASC)).toBe(0);
      expect(sortValues(null, undefined, ASC)).toBe(0);
    });

    it('should place null/undefined after defined values in ascending order', () => {
      expect(sortValues(null, 1, ASC)).toBe(1);
      expect(sortValues(undefined, 1, ASC)).toBe(1);
    });

    it('should place null/undefined before defined values in descending order', () => {
      expect(sortValues(null, 1, DESC)).toBe(-1);
      expect(sortValues(undefined, 1, DESC)).toBe(-1);
    });

    it('should handle when only b is nullish', () => {
      expect(sortValues(1, null, ASC)).toBe(-1);
      expect(sortValues(1, undefined, ASC)).toBe(-1);

      expect(sortValues(1, null, DESC)).toBe(1);
      expect(sortValues(1, undefined, DESC)).toBe(1);
    });
  });

  describe('number comparisons', () => {
    it('should sort numbers in ascending order', () => {
      expect(sortValues(1, 2, ASC)).toBe(-1);
      expect(sortValues(2, 1, ASC)).toBe(1);
    });

    it('should sort numbers in descending order', () => {
      expect(sortValues(1, 2, DESC)).toBe(1);
      expect(sortValues(2, 1, DESC)).toBe(-1);
    });

    it('should return 0 for equal numbers', () => {
      expect(sortValues(2, 2, ASC)).toBe(0);
      expect(sortValues(2, 2, DESC)).toBe(0);
    });
  });

  describe('string comparisons', () => {
    it('should sort strings in ascending order', () => {
      expect(sortValues('a', 'b', ASC)).toBe(-1);
      expect(sortValues('b', 'a', ASC)).toBe(1);
    });

    it('should sort strings in descending order', () => {
      expect(sortValues('a', 'b', DESC)).toBe(1);
      expect(sortValues('b', 'a', DESC)).toBe(-1);
    });

    it('should return 0 for equal strings', () => {
      expect(sortValues('a', 'a', ASC)).toBe(0);
    });
  });

  describe('mixed types', () => {
    it('should compare values using JS coercion rules', () => {
      // '2' < 10 => true (string coerced to number)
      expect(sortValues('2', 10, ASC)).toBe(-1);
      expect(sortValues('2', 10, DESC)).toBe(1);
    });

    it('should handle boolean comparisons', () => {
      // false < true
      expect(sortValues(false, true, ASC)).toBe(-1);
      expect(sortValues(false, true, DESC)).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should return 0 when values are strictly equal (===)', () => {
      const obj = {};
      expect(sortValues(obj, obj, ASC)).toBe(0);
    });

    it('should return 0 when values are not comparable (< and > both false)', () => {
      const a = {};
      const b = {};
      expect(sortValues(a, b, ASC)).toBe(0);
    });

    it('should handle NaN correctly', () => {
      expect(sortValues(NaN, 1, ASC)).toBe(0);
      expect(sortValues(1, NaN, ASC)).toBe(0);
      expect(sortValues(NaN, NaN, ASC)).toBe(0);
    });
  });
});
