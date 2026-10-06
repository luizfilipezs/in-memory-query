import { Query } from '../../query';
import { users } from '../fixtures/user-fixtures';

describe('Query', () => {
  describe('selection', () => {
    describe('select()', () => {
      it('should select a single column', () => {
        const result = Query.from(users).select('name').column();

        expect(result).toEqual(['John', 'Mary', 'Bob']);
      });

      it('should select multiple columns', () => {
        const result = Query.from(users).select('id', 'name').values();

        expect(result).toEqual([
          [1, 'John'],
          [2, 'Mary'],
          [3, 'Bob'],
        ]);
      });

      it('should return objects with only selected fields', () => {
        const result = Query.from(users).select('id', 'name').all();

        expect(result).toEqual([
          { id: 1, name: 'John' },
          { id: 2, name: 'Mary' },
          { id: 3, name: 'Bob' },
        ]);
      });

      it('should not include non-selected fields', () => {
        const result = Query.from(users).select('id').first();

        expect(result).toEqual({ id: 1 });
        expect((result as Record<string, unknown>)['name']).toBeUndefined();
      });

      it('should preserve ordering of the selected columns', () => {
        const ascOrderResult = Query.from(users)
          .orderBy('name')
          .select('name')
          .column();

        expect(ascOrderResult).toEqual(['Bob', 'John', 'Mary']);

        const descOrderResult = Query.from(users)
          .orderBy('-name')
          .select('name')
          .column();

        expect(descOrderResult).toEqual(['Mary', 'John', 'Bob']);
      });
    });

    describe('omit()', () => {
      it('should omit a single column', () => {
        const result = Query.from(users).omit('permissions').first();

        expect(result).toBeDefined();
        expect(
          (result as Record<string, unknown>)['permissions']
        ).toBeUndefined();
        expect((result as Record<string, unknown>)['id']).toBe(1);
        expect((result as Record<string, unknown>)['name']).toBe('John');
      });

      it('should omit multiple columns', () => {
        const result = Query.from(users)
          .omit('permissions', 'address', 'createdAt', 'updatedAt')
          .all();

        expect(result).toEqual([
          { id: 1, name: 'John', isActive: true },
          { id: 2, name: 'Mary', isActive: false },
          { id: 3, name: 'Bob', isActive: true },
        ]);
      });
    });
  });

  describe('mapping', () => {
    it('should map each row to a new object', () => {
      const result = Query.from(users).map((user) => ({
        id: user.id,
        name: user.name,
      }));

      expect(result.all()).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Mary' },
        { id: 3, name: 'Bob' },
      ]);
    });

    it('should provide correct index to callback', () => {
      const result = Query.from(users).map((user, index) => ({
        id: user.id,
        name: user.name,
        index,
      }));

      expect(result.all()).toEqual([
        { id: 1, name: 'John', index: 0 },
        { id: 2, name: 'Mary', index: 1 },
        { id: 3, name: 'Bob', index: 2 },
      ]);
    });
  });
});
