import { expectType } from 'tsd';
import { Query } from '../../query';
import { users } from '../fixtures/user-fixtures';

describe('Query', () => {
  describe('filtering', () => {
    describe('where()', () => {
      it('should filter using object conditions', () => {
        const result = Query.from(users).where({ isActive: true }).all();

        expect(result).toHaveLength(2);
        expect(result.every((u) => u.isActive)).toBe(true);
      });

      it('should filter using deep object conditions', () => {
        const result = Query.from(users)
          .where({ address: { country: 'Brazil' } })
          .all();

        expect(result).toHaveLength(2);
        expect(result.every((u) => u.address.country === 'Brazil')).toBe(true);
      });

      it('should filter using function condition', () => {
        const result = Query.from(users)
          .where((user) => user.isAdmin())
          .all();

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe(1);
      });

      it('should not allow unknown properties at development', () => {
        // @ts-expect-error
        const result = Query.from(users).where({ foo: 'bar' }).all();

        expect(result).toHaveLength(0);
      });

      it('should not allow empty object at development when type has no properties', () => {
        // @ts-expect-error
        const query = Query.from([{ fn: (): void => {} }]).where({});

        expectType<Query<{ fn: () => void }>>(query);
      });

      it('should combine multiple where calls', () => {
        const result = Query.from(users)
          .where({ isActive: true })
          .where((user) => user.permissions.useCookies)
          .all();

        expect(result).toHaveLength(2);
      });
    });

    describe('filterWhere()', () => {
      it('should ignore null conditions', () => {
        const result = Query.from(users)
          .filterWhere({
            isActive: null, // should be skipped
            id: 1,
          })
          .all();

        expect(result).toHaveLength(1);

        // avoid false positives
        const [firstRow] = result;

        expect(firstRow!.id).toBe(1);
        expect(firstRow!.isActive).not.toBeNull();
      });

      it('should ignore undefined conditions', () => {
        const result = Query.from(users)
          .filterWhere({
            isActive: undefined, // should be skipped
            id: 1,
          })
          .all();

        expect(result).toHaveLength(1);

        // avoid false positives
        const [firstRow] = result;

        expect(firstRow!.id).toBe(1);
        expect(firstRow!.isActive).not.toBeUndefined();
      });

      it('should work with deep conditions', () => {
        const result = Query.from(users)
          .filterWhere({
            address: {
              id: undefined, // should be skipped
              country: null, // should be skipped
              city: 'Brasília',
            },
          })
          .all();

        expect(result).toHaveLength(1);

        // avoid false positives
        const [firstRow] = result;

        expect(firstRow!.id).toBe(1);
        expect(firstRow!.address.city).toBe('Brasília');
        expect(firstRow!.address.id).not.toBeUndefined();
        expect(firstRow!.address.country).not.toBeNull();
      });

      it('should not allow unknown properties at development', () => {
        // @ts-expect-error
        const result = Query.from(users).filterWhere({ foo: 'bar' }).all();

        expect(result).toHaveLength(0);
      });

      it('should not allow empty object at development when type has no properties', () => {
        // @ts-expect-error
        const query = Query.from([{ fn: (): void => {} }]).filterWhere({});

        expectType<Query<{ fn: () => void }>>(query);
      });
    });

    describe('distinct()', () => {
      it('should return distinct values by key', () => {
        const result = Query.from(users)
          .select('isActive')
          .distinct('isActive')
          .all();

        expect(result).toEqual([{ isActive: true }, { isActive: false }]);
      });

      it('should return distinct values by callback', () => {
        const result = Query.from(users)
          .select('isActive')
          .distinct((user) => user.isActive)
          .all();

        expect(result).toEqual([{ isActive: true }, { isActive: false }]);
      });

      it('should preserve ordering', () => {
        const result = Query.from(users)
          .select('isActive')
          .orderBy('isActive')
          .distinct('isActive')
          .all();

        expect(result).toEqual([{ isActive: false }, { isActive: true }]);
      });
    });
  });
});
