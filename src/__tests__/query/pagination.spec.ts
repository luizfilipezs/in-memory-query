import { InvalidArgumentError } from '../../core/errors/invalid-argument-error';
import { Query } from '../../query';
import { type Address, addresses, users } from '../fixtures/user-fixtures';

describe('Query', () => {
  describe('pagination', () => {
    describe('skip()', () => {
      it('should skip rows', () => {
        const result = Query.from(users).select('id').skip(1).column();

        expect(result).toEqual([2, 3]);
      });

      it('should throw if skip is negative', () => {
        expect(() => Query.from(users).skip(-1)).toThrow(InvalidArgumentError);
      });
    });

    describe('limit()', () => {
      it('should limit rows', () => {
        const result = Query.from(users).select('id').limit(2).column();

        expect(result).toEqual([1, 2]);
      });

      it('should throw if limit is not an integer', () => {
        expect(() => Query.from(users).limit(1.5)).toThrow(
          InvalidArgumentError
        );
      });
    });

    describe('limitPerGroup()', () => {
      it('should limit rows per group using key', () => {
        const result = Query.from(addresses).limitPerGroup('country', 2).all();

        expect(result).toHaveLength(6);

        const grouped = Query.from(result).groupBy('country');

        expect(grouped.get('Brazil')).toHaveLength(2);
        expect(grouped.get('Chile')).toHaveLength(2);
        expect(grouped.get('Argentina')).toHaveLength(2);
      });

      it('should limit rows per group using callback', () => {
        const result = Query.from(addresses)
          .limitPerGroup((a) => a.country, 1)
          .all();

        expect(result).toHaveLength(3);

        const countries = result.map((r) => r.country);
        expect(new Set(countries).size).toBe(3);
      });

      it('should respect ordering before limiting', () => {
        const result = Query.from(addresses)
          .orderBy('-createdAt')
          .limitPerGroup('country', 1)
          .all();

        const grouped = Query.from(result).groupBy('country');

        expect(grouped.get('Brazil')?.[0]?.createdAt).toBe(3);
        expect(grouped.get('Chile')?.[0]?.createdAt).toBe(3);
        expect(grouped.get('Argentina')?.[0]?.createdAt).toBe(2);
      });

      it('should return empty array if no rows', () => {
        const result = Query.from<Address>([])
          .limitPerGroup('country', 2)
          .all();

        expect(result).toEqual([]);
      });

      it('should throw if limit is not an integer', () => {
        expect(() =>
          Query.from(addresses).limitPerGroup('country', 1.5)
        ).toThrow(InvalidArgumentError);
      });
    });

    describe('top()', () => {
      it('should return top N globally', () => {
        const result = Query.from(addresses).orderBy('-createdAt').top(3).all();

        expect(result).toHaveLength(3);
        expect(result[0]!.createdAt).toBeGreaterThanOrEqual(
          result[1]!.createdAt
        );
      });

      it('should return top N per group using key', () => {
        const result = Query.from(addresses)
          .top(2, {
            partitionBy: 'country',
            orderBy: '-createdAt',
          })
          .all();

        const grouped = Query.from(result).groupBy('country');

        expect(grouped.get('Brazil')).toHaveLength(2);
        expect(grouped.get('Chile')).toHaveLength(2);
        expect(grouped.get('Argentina')).toHaveLength(2);
      });

      it('should return top N per group using callback', () => {
        const result = Query.from(addresses)
          .top(1, {
            partitionBy: (a) => a.country,
            orderBy: '-createdAt',
          })
          .all();

        expect(result).toHaveLength(3);

        const grouped = Query.from(result).groupBy('country');

        expect(grouped.get('Brazil')?.[0]?.createdAt).toBe(3);
        expect(grouped.get('Chile')?.[0]?.createdAt).toBe(3);
        expect(grouped.get('Argentina')?.[0]?.createdAt).toBe(2);
      });

      it('should work with orderBy array', () => {
        const result = Query.from(addresses)
          .top(1, {
            partitionBy: (a) => a.country,
            orderBy: ['-createdAt'],
          })
          .all();

        expect(result).toHaveLength(3);

        const grouped = Query.from(result).groupBy('country');

        expect(grouped.get('Brazil')?.[0]?.createdAt).toBe(3);
        expect(grouped.get('Chile')?.[0]?.createdAt).toBe(3);
        expect(grouped.get('Argentina')?.[0]?.createdAt).toBe(2);
      });

      it('should work without orderBy (keep original order)', () => {
        const result = Query.from(addresses)
          .top(1, { partitionBy: 'country' })
          .all();

        expect(result).toEqual([
          addresses[0], // Brazil
          addresses[3], // Chile
          addresses[6], // Argentina
        ]);
      });

      it('should return empty if no rows', () => {
        const result = Query.from<Address>([]).top(2).all();

        expect(result).toEqual([]);
      });

      it('should throw if limit is not an integer', () => {
        expect(() => Query.from(addresses).top(1.5)).toThrow(
          InvalidArgumentError
        );
      });
    });

    describe('combined methods', () => {
      it('should combine skip and limit', () => {
        const result = Query.from(users).select('id').skip(1).limit(1).column();

        expect(result).toEqual([2]);
      });
    });

    describe('chunk()', () => {
      it('should split rows into chunks of specified size', () => {
        const chunks = Query.from(addresses).chunk(3);

        expect(chunks).toHaveLength(3);
        expect(chunks[0]).toHaveLength(3);
        expect(chunks[1]).toHaveLength(3);
        expect(chunks[2]).toHaveLength(2);
      });

      it('should return empty array if no rows', () => {
        const chunks = Query.from([]).chunk(2);

        expect(chunks).toEqual([]);
      });

      it('should throw if size is less than 1', () => {
        expect(() => Query.from(users).chunk(0)).toThrow(InvalidArgumentError);
      });

      it('should throw if size is not an integer', () => {
        expect(() => Query.from(users).chunk(1.5)).toThrow(
          InvalidArgumentError
        );
      });
    });
  });
});
