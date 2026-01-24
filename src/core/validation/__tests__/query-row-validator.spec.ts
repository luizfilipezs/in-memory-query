import { QueryRowValidator } from '../query-row-validator';

describe('QueryRowValidator', () => {
  describe('primitive comparisons', () => {
    it('should validate equality for primitive values', () => {
      const row = { id: 1, name: 'Alice' };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          id: 1,
          name: 'Alice',
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(true);
    });

    it('should return false when primitive values differ', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          id: 2,
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(false);
    });
  });

  describe('function conditions', () => {
    it('should validate using a function condition', () => {
      const row = { age: 30 };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          age: (value) => value > 18,
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(true);
    });

    it('should return false when function condition fails', () => {
      const row = { age: 15 };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          age: (value) => value > 18,
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(false);
    });
  });

  describe('array conditions', () => {
    it('should validate arrays using strict comparison', () => {
      const row = { tags: ['a', 'b'] };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          tags: ['a', 'b'],
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(true);
    });

    it('should return false for arrays with different values', () => {
      const row = { tags: ['a', 'b'] };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          tags: ['a', 'c'],
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(false);
    });

    it('should return false if condition is array but value is not', () => {
      const row = { tags: 'a,b' };

      const result = QueryRowValidator.validate(row as any, {
        conditionsObject: {
          tags: ['a', 'b'],
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(false);
    });
  });

  describe('object conditions (nested validation)', () => {
    it('should validate nested objects recursively', () => {
      const row = {
        user: {
          name: 'John',
          age: 25,
        },
      };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          user: {
            name: 'John',
            age: (value) => value >= 18,
          },
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(true);
    });

    it('should return false when nested validation fails', () => {
      const row = {
        user: {
          name: 'John',
          age: 15,
        },
      };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          user: {
            age: (value) => value >= 18,
          },
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(false);
    });

    it('should return false if condition is object but value is not', () => {
      const row = {
        user: 'John',
      };

      const result = QueryRowValidator.validate(row as any, {
        conditionsObject: {
          user: { name: 'John' },
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(false);
    });
  });

  describe('ignoreNullValues behavior', () => {
    it('should ignore null conditions when ignoreNullValues is true', () => {
      const row = { name: 'Alice' };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          name: null,
        },
        ignoreNullValues: true,
      });

      expect(result).toBe(true);
    });

    it('should ignore undefined conditions when ignoreNullValues is true', () => {
      const row = { name: 'Alice' };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          name: undefined,
        },
        ignoreNullValues: true,
      });

      expect(result).toBe(true);
    });

    it('should NOT ignore null when ignoreNullValues is false', () => {
      const row = { name: 'Alice' };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          name: null,
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(false);
    });
  });

  describe('multiple conditions', () => {
    it('should return true only if all conditions pass', () => {
      const row = {
        id: 1,
        active: true,
        roles: ['admin'],
      };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          id: 1,
          active: true,
          roles: ['admin'],
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(true);
    });

    it('should return false if at least one condition fails', () => {
      const row = {
        id: 1,
        active: false,
      };

      const result = QueryRowValidator.validate(row, {
        conditionsObject: {
          id: 1,
          active: true,
        },
        ignoreNullValues: false,
      });

      expect(result).toBe(false);
    });
  });
});
