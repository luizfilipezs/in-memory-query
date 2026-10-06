import { Query } from '../../query';
import { addresses, users } from '../fixtures/user-fixtures';

describe('Query', () => {
  describe('grouping', () => {
    it('should group rows by a simple property', () => {
      const result = Query.from(users).groupBy('isActive');

      expect(result.get(true)).toHaveLength(2);
      expect(result.get(false)).toHaveLength(1);
    });

    it('should group rows by id', () => {
      const result = Query.from(users).groupBy('id');

      expect(result.get(1)?.[0]?.name).toBe('John');
      expect(result.get(2)?.[0]?.name).toBe('Mary');
      expect(result.get(3)?.[0]?.name).toBe('Bob');
    });

    it('should group rows after filtering', () => {
      const result = Query.from(users)
        .where({ isActive: true })
        .groupBy('isActive');

      expect(result.get(true)).toHaveLength(2);
      expect(result.get(false)).toBeUndefined();
    });

    it('should group rows after ordering', () => {
      const result = Query.from(users).orderBy('-id').groupBy('isActive');
      const activeUsers = result.get(true)!;

      expect(activeUsers[0]!.id).toBe(3);
      expect(activeUsers[1]!.id).toBe(1);
    });

    it('should group rows respecting skip and limit', () => {
      const result = Query.from(users)
        .orderBy('id')
        .skip(1)
        .limit(1)
        .groupBy('isActive');

      // only user with id 2 should be in the results
      expect(result.size).toBe(1);
      expect(result.get(false)).toHaveLength(1);
      expect(result.get(false)?.[0]?.id).toBe(2);
    });

    it('should return an empty map if no rows', () => {
      const result = Query.from(users).where({ id: 999 }).groupBy('id');

      expect(result.size).toBe(0);
    });

    it('should group by Date property', () => {
      const result = Query.from(users).groupBy('createdAt');

      expect(result.size).toBe(3);
    });

    it('shold group by key and map results by another key', () => {
      const result = Query.from(users).groupBy('isActive', 'id');

      expect(result.get(true)).toEqual([1, 3]);
      expect(result.get(false)).toEqual([2]);
    });

    it('should group by key, map results by another key and aggregate them', () => {
      const groupKeys: string[] = [];
      const result = Query.from(addresses).groupBy(
        'country',
        'city',
        (cities, groupKey) => {
          groupKeys.push(groupKey);
          return cities.length;
        }
      );

      expect(groupKeys).toEqual(['Brazil', 'Chile', 'Argentina']);
      expect(result.get('Brazil')).toEqual(3);
      expect(result.get('Chile')).toEqual(3);
      expect(result.get('Argentina')).toEqual(2);
    });

    it('should group by key and map results by callback', () => {
      const result = Query.from(users).groupBy('isActive', (user) => user.id);

      expect(result.get(true)).toEqual([1, 3]);
      expect(result.get(false)).toEqual([2]);
    });

    it('should group by key, map results and aggregate them', () => {
      const groupKeys: string[] = [];
      const result = Query.from(addresses).groupBy(
        'country',
        (address) => address,
        (addresses, groupKey) => {
          groupKeys.push(groupKey);
          return addresses.length;
        }
      );

      expect(groupKeys).toEqual(['Brazil', 'Chile', 'Argentina']);
      expect(result.get('Brazil')).toEqual(3);
      expect(result.get('Chile')).toEqual(3);
      expect(result.get('Argentina')).toEqual(2);
    });

    it('should group by callback', () => {
      const result = Query.from(users).groupBy((user) => user.isActive);

      expect(result.get(true)).toHaveLength(2);
      expect(result.get(false)).toHaveLength(1);
    });

    it('should group by callback and map results by key', () => {
      const result = Query.from(users).groupBy(
        (user) => user.permissions.sendNotifications,
        'id'
      );

      expect(result.get(true)).toEqual([1, 2]);
      expect(result.get(false)).toEqual([3]);
    });

    it('should group by callback and map results by callback', () => {
      const result = Query.from(users).groupBy(
        (user) => user.permissions.sendNotifications,
        (user) => user.id
      );

      expect(result.get(true)).toEqual([1, 2]);
      expect(result.get(false)).toEqual([3]);
    });

    it('should group by callback, map results by key and aggregate them', () => {
      const groupKeys: string[] = [];
      const result = Query.from(users).groupBy(
        (user) => user.address.country,
        'id',
        (ids, groupKey) => {
          groupKeys.push(groupKey);
          return ids.length;
        }
      );

      expect(groupKeys).toEqual(['Brazil', 'Argentina']);
      expect(result.get('Brazil')).toEqual(2);
      expect(result.get('Argentina')).toEqual(1);
    });

    it('should group by callback, map results by callback and aggregate them', () => {
      const groupKeys: string[] = [];
      const result = Query.from(users).groupBy(
        (user) => user.address.country,
        (user) => user.address,
        (values, groupKey) => {
          groupKeys.push(groupKey);
          return values.length;
        }
      );

      expect(groupKeys).toEqual(['Brazil', 'Argentina']);
      expect(result.get('Brazil')).toEqual(2);
      expect(result.get('Argentina')).toEqual(1);
    });
  });
});
