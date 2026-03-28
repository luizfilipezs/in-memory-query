import { InvalidArgumentError } from '../core/errors';
import { Query } from '../query';

interface UserPermissions {
  useCookies: boolean;
  sendNotifications: boolean;
}

class User {
  constructor(
    public id: number,
    public name: string,
    public permissions: UserPermissions,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  isAdmin(): boolean {
    return this.id === 1;
  }
}

const users: User[] = [
  new User(
    1,
    'John',
    { useCookies: true, sendNotifications: true },
    true,
    new Date('2023-01-01'),
    new Date('2023-01-10')
  ),
  new User(
    2,
    'Mary',
    { useCookies: false, sendNotifications: true },
    false,
    new Date('2023-02-01'),
    new Date('2023-02-10')
  ),
  new User(
    3,
    'Bob',
    { useCookies: true, sendNotifications: false },
    true,
    new Date('2023-03-01'),
    new Date('2023-03-10')
  ),
];

describe('Query', () => {
  describe('creation', () => {
    it('should create a query from array', () => {
      const query = Query.from(users);
      expect(query.all().length).toBe(3);
    });
  });

  describe('filtering', () => {
    describe('where()', () => {
      it('should filter using object conditions', () => {
        const result = Query.from(users).where({ isActive: true }).all();

        expect(result).toHaveLength(2);
        expect(result.every((u) => u.isActive)).toBe(true);
      });

      it('should filter using function condition', () => {
        const result = Query.from(users)
          .where((user) => user.isAdmin())
          .all();

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe(1);
      });

      it('should combine multiple where calls', () => {
        const result = Query.from(users)
          .where({ isActive: true })
          .where((user) => user.permissions.useCookies)
          .all();

        expect(result).toHaveLength(2);
      });
    });

    describe('nested where()', () => {
      it('should filter using inner object conditions', () => {
        const result = Query.from(users)
          .where({
            permissions: {
              sendNotifications: true,
            },
          })
          .all();

        expect(result).toHaveLength(2);
      });
    });

    describe('filterWhere()', () => {
      it('should ignore null conditions', () => {
        const result = Query.from(users)
          .filterWhere({
            isActive: null,
            id: 1,
          })
          .all();

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe(1);
      });
    });
  });

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
        expect((result as any).name).toBeUndefined();
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

    describe('column()', () => {
      it('should return an array of the first column values by default', () => {
        const result = Query.from(users).column();

        expect(result).toEqual([1, 2, 3]);
      });

      it('should return an array of the specified column values', () => {
        const result = Query.from(users).column('name');

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
    });
  });

  describe('ordering', () => {
    it('should order by ascending property', () => {
      const result = Query.from(users).select('name').orderBy('name').column();

      expect(result).toEqual(['Bob', 'John', 'Mary']);
    });

    it('should order by descending property', () => {
      const result = Query.from(users).select('id').orderBy('-id').column();

      expect(result).toEqual([3, 2, 1]);
    });

    it('should order by multiple properties', () => {
      const result = Query.from(users)
        .select('id', 'isActive')
        .orderBy('isActive', '-id')
        .column();

      expect(result).toEqual([2, 3, 1]);
    });

    it('should override order defined previously', () => {
      const result = Query.from(users)
        .select('id')
        .orderBy('id')
        .orderBy('-id')
        .column();

      expect(result).toEqual([3, 2, 1]);
    });

    it('should clear order defined previously', () => {
      const result = Query.from(users)
        .select('id')
        .orderBy('-id')
        .orderBy()
        .column();

      expect(result).toEqual([1, 2, 3]);
    });
  });

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
  });

  describe('pagination', () => {
    it('should skip rows', () => {
      const result = Query.from(users).select('id').skip(1).column();

      expect(result).toEqual([2, 3]);
    });

    it('should limit rows', () => {
      const result = Query.from(users).select('id').limit(2).column();

      expect(result).toEqual([1, 2]);
    });

    it('should combine skip and limit', () => {
      const result = Query.from(users).select('id').skip(1).limit(1).column();

      expect(result).toEqual([2]);
    });

    it('should throw if skip is negative', () => {
      expect(() => Query.from(users).skip(-1)).toThrow(InvalidArgumentError);
    });

    it('should throw if limit is not an integer', () => {
      expect(() => Query.from(users).limit(1.5)).toThrow(InvalidArgumentError);
    });
  });

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

    it('scalar() should return false if no results', () => {
      const result = Query.from(users).where({ id: 99 }).scalar();

      expect(result).toBe(false);
    });
  });
});
