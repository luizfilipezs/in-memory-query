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
      expect(result[0].id).toBe(1);
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
    it('should ignore null and undefined conditions', () => {
      const isActive: boolean | undefined = undefined;

      const result = Query.from(users)
        .filterWhere({
          isActive,
          id: 1,
        })
        .all();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('select()', () => {
    it('should select a single column', () => {
      const result = Query.from(users).select('name').column();

      expect(result).toEqual(['John', 'Mary', 'Bob']);
    });

    it('should select multiple columns', () => {
      const result = Query.from(users).select(['id', 'name']).values();

      expect(result).toEqual([
        [1, 'John'],
        [2, 'Mary'],
        [3, 'Bob'],
      ]);
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
        .orderBy('isActive', '-id')
        .select('id')
        .column();

      expect(result).toEqual([2, 3, 1]);
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

    it('last()', () => {
      expect(Query.from(users).last()?.id).toBe(3);
    });

    it('scalar()', () => {
      const id = Query.from(users).select('id').scalar();

      expect(id).toBe(1);
    });

    it('scalar() should return false if no results', () => {
      const result = Query.from(users).where({ id: 99 }).scalar();

      expect(result).toBe(false);
    });
  });
});
