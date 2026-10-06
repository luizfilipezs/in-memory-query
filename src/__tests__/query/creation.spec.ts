import { expectType } from 'tsd';
import { Query } from '../../query';
import { type User, users } from '../fixtures/user-fixtures';

describe('Query', () => {
  describe('creation', () => {
    it('should create a query from array', () => {
      const query = Query.from(users);
      expect(query.all().length).toBe(3);
      expectType<Query<User>>(query);
    });

    it('should create a query from iterable (Set)', () => {
      const query = Query.from(new Set(users));
      expect(query.all().length).toBe(3);
      expectType<Query<User>>(query);
    });

    it('should create a query from valid iterable (Map.values())', () => {
      const query = Query.from(new Map(users.map((u) => [u.id, u])).values());
      expect(query.all().length).toBe(3);
      expectType<Query<User>>(query);
    });
  });
});
