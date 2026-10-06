import { Query } from '../../query';
import { type User, users } from '../fixtures/user-fixtures';

describe('Query', () => {
  describe('result helpers', () => {
    it('count()', () => {
      expect(Query.from(users).count()).toBe(3);
    });

    it('exists()', () => {
      expect(Query.from(users).where({ id: 99 }).exists()).toBe(false);
    });

    it('first()', () => {
      expect(Query.from(users).first()?.id).toBe(1);
    });

    describe('last()', () => {
      it('should return the last object', () => {
        expect(Query.from(users).last()?.id).toBe(3);
      });

      it('should return null if no results', () => {
        expect(Query.from(users).where({ id: 99 }).last()).toBeNull();
      });
    });

    describe('scalar()', () => {
      it('should return the first cell', () => {
        const id = Query.from(users).select('id').scalar();

        expect(id).toBe(1);
      });

      it('should return false if no results', () => {
        const id = Query.from([]).scalar();

        expect(id).toBe(false);
      });
    });

    describe('column()', () => {
      it('should return an array of the first column values by default', () => {
        const result = Query.from(users).column();

        expect(result).toEqual([1, 2, 3]);
      });

      it('should return an array of the specified column values', () => {
        const result = Query.from(users).column('name');

        expect(result).toEqual(['John', 'Mary', 'Bob']);
      });

      it('should return an array of the mapped column values', () => {
        const result = Query.from(users).column((user) => user.name);

        expect(result).toEqual(['John', 'Mary', 'Bob']);
      });

      it('should preserve ordering', () => {
        const result = Query.from(users).orderBy('name').column('name');

        expect(result).toEqual(['Bob', 'John', 'Mary']);
      });

      it('should return empty array if objects have no properties', () => {
        const result = Query.from([{}]).column();

        expect(result).toEqual([]);
      });

      it('should return empty array if no rows', () => {
        const result = Query.from([]).column();

        expect(result).toEqual([]);
      });
    });

    describe('min()', () => {
      describe('with key', () => {
        it('should return the minimum value', () => {
          const result = Query.from([
            { value: 3 },
            { value: 1 },
            { value: 2 },
          ]).min('value');

          expect(result).toBe(1);
        });

        it('should work with negative values', () => {
          const result = Query.from([
            { value: 3 },
            { value: -1 },
            { value: 2 },
          ]).min('value');

          expect(result).toBe(-1);
        });

        it('should return null if no results', () => {
          const result = Query.from<User>([]).min('id');

          expect(result).toBeNull();
        });
      });

      describe('with callback', () => {
        it('should return the minimum value', () => {
          const result = Query.from([
            { value: 3 },
            { value: 1 },
            { value: 2 },
          ]).min((row) => row.value);

          expect(result).toBe(1);
        });

        it('should work with negative values', () => {
          const result = Query.from([
            { value: 3 },
            { value: -1 },
            { value: 2 },
          ]).min((row) => row.value);

          expect(result).toBe(-1);
        });

        it('should return null if no results', () => {
          const result = Query.from<User>([]).min((row) => row.id);

          expect(result).toBeNull();
        });
      });
    });

    describe('max()', () => {
      describe('with key', () => {
        it('should return the maximum value', () => {
          const result = Query.from([
            { value: 3 },
            { value: 1 },
            { value: 2 },
          ]).max('value');

          expect(result).toBe(3);
        });

        it('should work with negative values', () => {
          const result = Query.from([
            { value: 3 },
            { value: -1 },
            { value: 2 },
          ]).max('value');

          expect(result).toBe(3);
        });

        it('should return null if no results', () => {
          const result = Query.from<User>([]).max('id');

          expect(result).toBeNull();
        });
      });

      describe('with callback', () => {
        it('should return the maximum value', () => {
          const result = Query.from([
            { value: 3 },
            { value: 1 },
            { value: 2 },
          ]).max((row) => row.value);

          expect(result).toBe(3);
        });

        it('should work with negative values', () => {
          const result = Query.from([
            { value: 3 },
            { value: -1 },
            { value: 2 },
          ]).max((row) => row.value);

          expect(result).toBe(3);
        });

        it('should return null if no results', () => {
          const result = Query.from<User>([]).max((row) => row.id);

          expect(result).toBeNull();
        });
      });
    });

    describe('sum()', () => {
      describe('with key', () => {
        it('should return the sum', () => {
          const result = Query.from([
            { value: 3 },
            { value: 1 },
            { value: 2 },
          ]).sum('value');

          expect(result).toBe(6);
        });

        it('should work with negative values', () => {
          const result = Query.from([
            { value: 3 },
            { value: -1 },
            { value: 2 },
          ]).sum('value');

          expect(result).toBe(4);
        });

        it('should return zero if no results', () => {
          const result = Query.from<User>([]).sum('id');

          expect(result).toBe(0);
        });
      });

      describe('with callback', () => {
        it('should return the sum', () => {
          const result = Query.from([
            { value: 3 },
            { value: 1 },
            { value: 2 },
          ]).sum((row) => row.value);

          expect(result).toBe(6);
        });

        it('should work with negative values', () => {
          const result = Query.from([
            { value: 3 },
            { value: -1 },
            { value: 2 },
          ]).sum((row) => row.value);

          expect(result).toBe(4);
        });

        it('should return zero if no results', () => {
          const result = Query.from<User>([]).sum((row) => row.id);

          expect(result).toBe(0);
        });
      });
    });

    describe('average()', () => {
      describe('with key', () => {
        it('should return the average', () => {
          const result = Query.from([
            { value: 3 },
            { value: 1 },
            { value: 2 },
          ]).average('value');

          expect(result).toBe(2);
        });

        it('should work with negative values', () => {
          const result = Query.from([
            { value: 3 },
            { value: -1 },
            { value: 2 },
          ]).average('value');

          expect(result).toBeCloseTo(1.33);
        });

        it('should return null if no results', () => {
          const result = Query.from<User>([]).average('id');

          expect(result).toBeNull();
        });
      });

      describe('with callback', () => {
        it('should return the average', () => {
          const result = Query.from([
            { value: 3 },
            { value: 1 },
            { value: 2 },
          ]).average((row) => row.value);

          expect(result).toBe(2);
        });

        it('should work with negative values', () => {
          const result = Query.from([
            { value: 3 },
            { value: -1 },
            { value: 2 },
          ]).average((row) => row.value);

          expect(result).toBeCloseTo(1.33);
        });

        it('should return null if no results', () => {
          const result = Query.from<User>([]).average((row) => row.id);

          expect(result).toBeNull();
        });
      });
    });
  });
});
