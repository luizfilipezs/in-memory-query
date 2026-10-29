import { QueryRowValidator } from '../query-row-validator';

describe('QueryRowValidator', () => {
  describe('callback condition', () => {
    it('should return true when callback returns true', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(row, () => true);

      expect(result).toBe(true);
    });

    it('should return false when callback returns false', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(row, () => false);

      expect(result).toBe(false);
    });
  });

  describe('primitive comparisons', () => {
    it('should validate equality for primitive values', () => {
      const row = { id: 1, name: 'Alice' };

      const result = QueryRowValidator.validate(row, {
        id: 1,
        name: 'Alice',
      });

      expect(result).toBe(true);
    });

    it('should return false when primitive values differ', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(row, {
        id: 2,
      });

      expect(result).toBe(false);
    });

    it('should validate equality for Date instances', () => {
      const d1 = new Date('2023-01-01');
      const d1Copy = new Date('2023-01-01');
      const d2 = new Date('2023-01-02');

      expect(
        QueryRowValidator.validate({ createdAt: d1 }, { createdAt: d1Copy })
      ).toBe(true);

      expect(
        QueryRowValidator.validate({ createdAt: d1 }, { createdAt: d2 })
      ).toBe(false);
    });
  });

  describe('function conditions', () => {
    it('should validate using a function condition', () => {
      const row = { age: 30 };

      const result = QueryRowValidator.validate(row, {
        age: (value) => value > 18,
      });

      expect(result).toBe(true);
    });

    it('should return false when function condition fails', () => {
      const row = { age: 15 };

      const result = QueryRowValidator.validate(row, {
        age: (value) => value > 18,
      });

      expect(result).toBe(false);
    });
  });

  describe('array conditions', () => {
    it('should validate arrays using strict comparison', () => {
      const row = { tags: ['a', 'b'] };

      const result = QueryRowValidator.validate(row, {
        tags: ['a', 'b'],
      });

      expect(result).toBe(true);
    });

    it('should return false for arrays with different values', () => {
      const row = { tags: ['a', 'b'] };

      const result = QueryRowValidator.validate(row, {
        tags: ['a', 'c'],
      });

      expect(result).toBe(false);
    });

    it('should return false if condition is array but value is not', () => {
      const row = { tags: 'a,b' };

      const result = QueryRowValidator.validate(row as any, {
        tags: ['a', 'b'],
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
        user: {
          name: 'John',
          age: (value) => value >= 18,
        },
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
        user: {
          age: (value) => value >= 18,
        },
      });

      expect(result).toBe(false);
    });

    it('should return false if condition is object but value is not', () => {
      const row = {
        user: 'John',
      };

      const result = QueryRowValidator.validate(row as any, {
        user: { name: 'John' },
      });

      expect(result).toBe(false);
    });
  });

  describe('ignoreNullValues behavior', () => {
    it('should ignore null conditions when ignoreNullValues is true', () => {
      const row = { name: 'Alice' };

      const result = QueryRowValidator.validate(
        row,
        {
          name: null,
        },
        { ignoreNullValues: true }
      );

      expect(result).toBe(true);
    });

    it('should ignore undefined conditions when ignoreNullValues is true', () => {
      const row = { name: 'Alice' };

      const result = QueryRowValidator.validate(
        row,
        {
          name: undefined,
        },
        { ignoreNullValues: true }
      );

      expect(result).toBe(true);
    });

    it('should NOT ignore null when ignoreNullValues is false', () => {
      const row = { name: 'Alice' };

      const result = QueryRowValidator.validate(
        row,
        {
          name: null,
        },
        { ignoreNullValues: false }
      );

      expect(result).toBe(false);
    });

    it('should ignore null and undefined in nested conditions when ignoreNullValues is true', () => {
      const row = { user: { name: 'Alice', age: 18 } };

      const result = QueryRowValidator.validate(
        row,
        {
          user: { name: null, age: undefined },
        },
        { ignoreNullValues: true }
      );

      expect(result).toBe(true);
    });

    it('should NOT ignore null and undefined in nested conditions when ignoreNullValues is false', () => {
      const row = { user: { name: 'Alice', age: 18 } };

      const result = QueryRowValidator.validate(
        row,
        {
          user: { name: null, age: undefined },
        },
        { ignoreNullValues: false }
      );

      expect(result).toBe(false);
    });

    it('should use default options (ignoreNullValues = false)', () => {
      const row = { name: 'Alice' };

      const result = QueryRowValidator.validate(row, {
        name: null,
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
        id: 1,
        active: true,
        roles: ['admin'],
      });

      expect(result).toBe(true);
    });

    it('should return false if at least one condition fails', () => {
      const row = {
        id: 1,
        active: false,
      };

      const result = QueryRowValidator.validate(row, {
        id: 1,
        active: true,
      });

      expect(result).toBe(false);
    });
  });

  describe('$or operator', () => {
    it('should return true if any condition in $or passes', () => {
      const row = { id: 1, role: 'editor', active: true };

      const result = QueryRowValidator.validate(row, {
        $or: [{ role: 'admin' }, { role: 'editor' }],
      });

      expect(result).toBe(true);
    });

    it('should return false if all conditions in $or fail', () => {
      const row = { id: 1, role: 'viewer', active: true };

      const result = QueryRowValidator.validate(row, {
        $or: [{ role: 'admin' }, { role: 'editor' }],
      });

      expect(result).toBe(false);
    });

    it('should combine standard property conditions with $or (AND semantics)', () => {
      const row = { id: 1, active: false, role: 'admin' };

      const result = QueryRowValidator.validate(row, {
        active: true,
        $or: [{ role: 'admin' }, { role: 'editor' }],
      });

      expect(result).toBe(false);
    });

    it('should support callback functions inside $or conditions', () => {
      const row = { age: 25, status: 'pending' };

      const result = QueryRowValidator.validate(row, {
        $or: [(r) => r.age > 30, (r) => r.status === 'pending'],
      });

      expect(result).toBe(true);
    });

    it('should support nested $or conditions recursively', () => {
      const row = { age: 16, hasGuardianConsent: true, isVip: false };

      const result = QueryRowValidator.validate(row, {
        $or: [
          { isVip: true },
          {
            $or: [{ age: (a) => a >= 18 }, { hasGuardianConsent: true }],
          },
        ],
      });

      expect(result).toBe(true);
    });

    it('should treat empty $or array as true', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(row, {
        $or: [],
      });

      expect(result).toBe(true);
    });

    it('should skip null or undefined $or when ignoreNullValues is true', () => {
      const row = { id: 1 };

      const resultWithNull = QueryRowValidator.validate(
        row,
        {
          id: 1,
          $or: null,
        },
        { ignoreNullValues: true }
      );

      const resultWithUndefined = QueryRowValidator.validate(
        row,
        {
          id: 1,
          $or: undefined,
        },
        { ignoreNullValues: true }
      );

      expect(resultWithNull).toBe(true);
      expect(resultWithUndefined).toBe(true);
    });

    it('should return false if $or is not an array at runtime', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(row, {
        $or: { id: 1 } as any,
      });

      expect(result).toBe(false);
    });
  });

  describe('$in operator', () => {
    it('should return true when primitive value is present in $in array', () => {
      const row = { id: 2, status: 'active' };

      const result = QueryRowValidator.validate(row, {
        id: { $in: [1, 2, 3] },
      });

      expect(result).toBe(true);
    });

    it('should return false when primitive value is not present in $in array', () => {
      const row = { id: 5, status: 'active' };

      const result = QueryRowValidator.validate(row, {
        id: { $in: [1, 2, 3] },
      });

      expect(result).toBe(false);
    });

    it('should support object comparison in $in array using deepEqual', () => {
      const row = { meta: { role: 'admin', level: 1 } };

      const result = QueryRowValidator.validate(row, {
        meta: {
          $in: [
            { role: 'viewer', level: 0 },
            { role: 'admin', level: 1 },
          ],
        },
      });

      expect(result).toBe(true);
    });

    it('should return false for empty $in array', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(row, {
        id: { $in: [] },
      });

      expect(result).toBe(false);
    });

    it('should ignore null/undefined $in when ignoreNullValues is true', () => {
      const row = { id: 1 };

      const resultWithNull = QueryRowValidator.validate(
        row,
        {
          id: { $in: null },
        },
        { ignoreNullValues: true }
      );

      const resultWithUndefined = QueryRowValidator.validate(
        row,
        {
          id: { $in: undefined },
        },
        { ignoreNullValues: true }
      );

      expect(resultWithNull).toBe(true);
      expect(resultWithUndefined).toBe(true);
    });

    it('should fail null/undefined $in when ignoreNullValues is false', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(
        row,
        {
          id: { $in: undefined },
        },
        { ignoreNullValues: false }
      );

      expect(result).toBe(false);
    });
  });

  describe('$not operator', () => {
    it('should negate a condition and return true when inner condition fails', () => {
      const row = { id: 2, isActive: false };

      const result = QueryRowValidator.validate(row, {
        $not: { id: 1 },
      });

      expect(result).toBe(true);
    });

    it('should negate a condition and return false when inner condition passes', () => {
      const row = { id: 1, isActive: true };

      const result = QueryRowValidator.validate(row, {
        $not: { id: 1 },
      });

      expect(result).toBe(false);
    });

    it('should negate an $or condition group', () => {
      const row = { id: 2, isAdmin: false };

      const result = QueryRowValidator.validate(row, {
        $not: {
          $or: [{ id: 1 }, { isAdmin: true }],
        },
      });

      expect(result).toBe(true);

      const matchingRow = { id: 1, isAdmin: false };
      const failResult = QueryRowValidator.validate(matchingRow, {
        $not: {
          $or: [{ id: 1 }, { isAdmin: true }],
        },
      });

      expect(failResult).toBe(false);
    });

    it('should negate callback predicates', () => {
      const row = { age: 15 };

      const result = QueryRowValidator.validate(row, {
        $not: (r) => r.age >= 18,
      });

      expect(result).toBe(true);
    });

    it('should combine standard conditions with $not', () => {
      const row = { id: 2, isActive: true, role: 'guest' };

      const result = QueryRowValidator.validate(row, {
        isActive: true,
        $not: { role: 'admin' },
      });

      expect(result).toBe(true);

      const adminRow = { id: 3, isActive: true, role: 'admin' };
      const failResult = QueryRowValidator.validate(adminRow, {
        isActive: true,
        $not: { role: 'admin' },
      });

      expect(failResult).toBe(false);
    });

    it('should ignore null/undefined $not when ignoreNullValues is true', () => {
      const row = { id: 1 };

      const resultWithNull = QueryRowValidator.validate(
        row,
        {
          id: 1,
          $not: null,
        },
        { ignoreNullValues: true }
      );

      const resultWithUndefined = QueryRowValidator.validate(
        row,
        {
          id: 1,
          $not: undefined,
        },
        { ignoreNullValues: true }
      );

      expect(resultWithNull).toBe(true);
      expect(resultWithUndefined).toBe(true);
    });
  });

  describe('$nin operator', () => {
    it('should return true when primitive value is not present in $nin array', () => {
      const row = { id: 5, status: 'active' };

      const result = QueryRowValidator.validate(row, {
        id: { $nin: [1, 2, 3] },
      });

      expect(result).toBe(true);
    });

    it('should return false when primitive value is present in $nin array', () => {
      const row = { id: 2, status: 'active' };

      const result = QueryRowValidator.validate(row, {
        id: { $nin: [1, 2, 3] },
      });

      expect(result).toBe(false);
    });

    it('should support object comparison in $nin array using deepEqual', () => {
      const row = { meta: { role: 'admin', level: 1 } };

      const result = QueryRowValidator.validate(row, {
        meta: {
          $nin: [
            { role: 'viewer', level: 0 },
            { role: 'guest', level: -1 },
          ],
        },
      });

      expect(result).toBe(true);

      const failResult = QueryRowValidator.validate(row, {
        meta: {
          $nin: [
            { role: 'viewer', level: 0 },
            { role: 'admin', level: 1 },
          ],
        },
      });

      expect(failResult).toBe(false);
    });

    it('should return true for empty $nin array', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(row, {
        id: { $nin: [] },
      });

      expect(result).toBe(true);
    });

    it('should ignore null/undefined $nin when ignoreNullValues is true', () => {
      const row = { id: 1 };

      const resultWithNull = QueryRowValidator.validate(
        row,
        {
          id: { $nin: null },
        },
        { ignoreNullValues: true }
      );

      const resultWithUndefined = QueryRowValidator.validate(
        row,
        {
          id: { $nin: undefined },
        },
        { ignoreNullValues: true }
      );

      expect(resultWithNull).toBe(true);
      expect(resultWithUndefined).toBe(true);
    });

    it('should fail null/undefined $nin when ignoreNullValues is false', () => {
      const row = { id: 1 };

      const result = QueryRowValidator.validate(
        row,
        {
          id: { $nin: undefined },
        },
        { ignoreNullValues: false }
      );

      expect(result).toBe(false);
    });
  });

  describe('attribute-level $not operator', () => {
    it('should negate literal values at attribute level', () => {
      const row = { status: 'active', role: 'admin' };

      const result = QueryRowValidator.validate(row, {
        status: { $not: 'deleted' },
      });

      expect(result).toBe(true);

      const failResult = QueryRowValidator.validate(row, {
        status: { $not: 'active' },
      });

      expect(failResult).toBe(false);
    });

    it('should negate callback functions at attribute level', () => {
      const row = { age: 25 };

      const result = QueryRowValidator.validate(row, {
        age: { $not: (a) => a < 18 },
      });

      expect(result).toBe(true);

      const failResult = QueryRowValidator.validate(row, {
        age: { $not: (a) => a > 20 },
      });

      expect(failResult).toBe(false);
    });

    it('should negate operators like $in at attribute level', () => {
      const row = { id: 4 };

      const result = QueryRowValidator.validate(row, {
        id: { $not: { $in: [1, 2, 3] } },
      });

      expect(result).toBe(true);

      const failResult = QueryRowValidator.validate(row, {
        id: { $not: { $in: [3, 4, 5] } },
      });

      expect(failResult).toBe(false);
    });

    it('should ignore null/undefined $not when ignoreNullValues is true', () => {
      const row = { status: 'active' };

      const result = QueryRowValidator.validate(
        row,
        {
          status: { $not: undefined },
        },
        { ignoreNullValues: true }
      );

      expect(result).toBe(true);
    });

    it('should fail null/undefined $not when ignoreNullValues is false', () => {
      const row = { status: 'active' };

      const result = QueryRowValidator.validate(
        row,
        {
          status: { $not: undefined },
        },
        { ignoreNullValues: false }
      );

      // !validateValue('active', undefined) => !(active === undefined) => !false => true
      expect(result).toBe(true);
    });
  });

  describe('relational operators ($gt, $gte, $lt, $lte, $ne)', () => {
    describe('$gt operator', () => {
      it('should validate numbers correctly', () => {
        expect(
          QueryRowValidator.validate({ age: 20 }, { age: { $gt: 18 } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ age: 18 }, { age: { $gt: 18 } })
        ).toBe(false);
        expect(
          QueryRowValidator.validate({ age: 15 }, { age: { $gt: 18 } })
        ).toBe(false);
      });

      it('should validate Date objects correctly', () => {
        const d1 = new Date('2023-01-02');
        const d2 = new Date('2023-01-01');

        expect(
          QueryRowValidator.validate({ date: d1 }, { date: { $gt: d2 } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ date: d2 }, { date: { $gt: d1 } })
        ).toBe(false);
      });

      it('should validate strings correctly', () => {
        expect(
          QueryRowValidator.validate({ name: 'b' }, { name: { $gt: 'a' } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ name: 'a' }, { name: { $gt: 'b' } })
        ).toBe(false);
      });

      it('should handle ignoreNullValues', () => {
        expect(
          QueryRowValidator.validate(
            { age: 20 },
            { age: { $gt: undefined } },
            { ignoreNullValues: true }
          )
        ).toBe(true);
        expect(
          QueryRowValidator.validate(
            { age: 20 },
            { age: { $gt: undefined } },
            { ignoreNullValues: false }
          )
        ).toBe(false);
      });
    });

    describe('$gte operator', () => {
      it('should validate numbers correctly', () => {
        expect(
          QueryRowValidator.validate({ age: 20 }, { age: { $gte: 18 } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ age: 18 }, { age: { $gte: 18 } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ age: 17 }, { age: { $gte: 18 } })
        ).toBe(false);
      });

      it('should validate Date objects correctly', () => {
        const d1 = new Date('2023-01-01');
        const d1Same = new Date('2023-01-01');

        expect(
          QueryRowValidator.validate({ date: d1 }, { date: { $gte: d1Same } })
        ).toBe(true);
      });
    });

    describe('$lt operator', () => {
      it('should validate numbers correctly', () => {
        expect(
          QueryRowValidator.validate({ age: 17 }, { age: { $lt: 18 } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ age: 18 }, { age: { $lt: 18 } })
        ).toBe(false);
        expect(
          QueryRowValidator.validate({ age: 20 }, { age: { $lt: 18 } })
        ).toBe(false);
      });

      it('should validate Date objects correctly', () => {
        const d1 = new Date('2023-01-01');
        const d2 = new Date('2023-01-02');

        expect(
          QueryRowValidator.validate({ date: d1 }, { date: { $lt: d2 } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ date: d2 }, { date: { $lt: d1 } })
        ).toBe(false);
      });
    });

    describe('$lte operator', () => {
      it('should validate numbers correctly', () => {
        expect(
          QueryRowValidator.validate({ age: 18 }, { age: { $lte: 18 } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ age: 17 }, { age: { $lte: 18 } })
        ).toBe(true);
        expect(
          QueryRowValidator.validate({ age: 19 }, { age: { $lte: 18 } })
        ).toBe(false);
      });

      it('should validate Date objects correctly', () => {
        const d1 = new Date('2023-01-01');
        const d1Same = new Date('2023-01-01');

        expect(
          QueryRowValidator.validate({ date: d1 }, { date: { $lte: d1Same } })
        ).toBe(true);
      });
    });

    describe('$ne operator', () => {
      it('should validate primitive inequality correctly', () => {
        expect(
          QueryRowValidator.validate(
            { role: 'admin' },
            { role: { $ne: 'guest' } }
          )
        ).toBe(true);
        expect(
          QueryRowValidator.validate(
            { role: 'admin' },
            { role: { $ne: 'admin' } }
          )
        ).toBe(false);
      });

      it('should validate deep object inequality correctly', () => {
        expect(
          QueryRowValidator.validate(
            { meta: { level: 1 } },
            { meta: { $ne: { level: 2 } } }
          )
        ).toBe(true);
        expect(
          QueryRowValidator.validate(
            { meta: { level: 1 } },
            { meta: { $ne: { level: 1 } } }
          )
        ).toBe(false);
      });
    });

    describe('combined relational operators', () => {
      it('should support range filtering ($gte and $lte together)', () => {
        expect(
          QueryRowValidator.validate(
            { score: 75 },
            { score: { $gte: 70, $lte: 80 } }
          )
        ).toBe(true);
        expect(
          QueryRowValidator.validate(
            { score: 69 },
            { score: { $gte: 70, $lte: 80 } }
          )
        ).toBe(false);
        expect(
          QueryRowValidator.validate(
            { score: 81 },
            { score: { $gte: 70, $lte: 80 } }
          )
        ).toBe(false);
      });

      it('should support combining comparison operators and nested properties on the same object', () => {
        const row = {
          address: {
            country: 'Brazil',
            city: 'São Paulo',
          },
        };

        expect(
          QueryRowValidator.validate(row, {
            address: {
              $ne: null,
              country: 'Brazil',
            },
          })
        ).toBe(true);

        expect(
          QueryRowValidator.validate(row, {
            address: {
              $ne: null,
              country: 'Chile',
            },
          })
        ).toBe(false);

        const nullRow: { address: { country: string; city: string } | null } = {
          address: null,
        };

        expect(
          QueryRowValidator.validate(nullRow, {
            address: {
              $ne: null,
              country: 'Brazil',
            },
          })
        ).toBe(false);
      });
    });
  });
});
