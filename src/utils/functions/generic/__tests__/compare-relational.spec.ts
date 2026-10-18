import { compareRelational } from '../compare-relational';

describe('compareRelational', () => {
  describe('numbers', () => {
    it('should correctly evaluate $gt', () => {
      expect(compareRelational(10, 5, '$gt')).toBe(true);
      expect(compareRelational(5, 10, '$gt')).toBe(false);
      expect(compareRelational(5, 5, '$gt')).toBe(false);
    });

    it('should correctly evaluate $gte', () => {
      expect(compareRelational(10, 5, '$gte')).toBe(true);
      expect(compareRelational(5, 5, '$gte')).toBe(true);
      expect(compareRelational(4, 5, '$gte')).toBe(false);
    });

    it('should correctly evaluate $lt', () => {
      expect(compareRelational(4, 5, '$lt')).toBe(true);
      expect(compareRelational(5, 5, '$lt')).toBe(false);
      expect(compareRelational(6, 5, '$lt')).toBe(false);
    });

    it('should correctly evaluate $lte', () => {
      expect(compareRelational(4, 5, '$lte')).toBe(true);
      expect(compareRelational(5, 5, '$lte')).toBe(true);
      expect(compareRelational(6, 5, '$lte')).toBe(false);
    });
  });

  describe('dates', () => {
    it('should correctly compare Date instances', () => {
      const earlier = new Date('2023-01-01');
      const later = new Date('2023-01-02');

      expect(compareRelational(later, earlier, '$gt')).toBe(true);
      expect(compareRelational(earlier, later, '$lt')).toBe(true);
      expect(compareRelational(earlier, new Date('2023-01-01'), '$gte')).toBe(
        true
      );
    });
  });

  describe('strings', () => {
    it('should correctly compare strings alphabetically', () => {
      expect(compareRelational('banana', 'apple', '$gt')).toBe(true);
      expect(compareRelational('apple', 'banana', '$lt')).toBe(true);
    });
  });

  describe('null / undefined / incompatible types', () => {
    it('should return false if either operand is null or undefined', () => {
      expect(compareRelational(null, 5, '$gt')).toBe(false);
      expect(compareRelational(5, null, '$gt')).toBe(false);
      expect(compareRelational(undefined, 5, '$gt')).toBe(false);
      expect(compareRelational(5, undefined, '$gt')).toBe(false);
    });

    it('should return false for unsupported object types', () => {
      expect(compareRelational({}, {}, '$gt')).toBe(false);
    });
  });
});
