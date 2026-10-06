import { Query } from '../../query';
import { users } from '../fixtures/user-fixtures';

describe('Query', () => {
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

    it('should override ordering when chaining', () => {
      const result = Query.from(users)
        .select('id', 'isActive')
        .orderBy('-id')
        .orderBy('isActive')
        .column();

      expect(result).toEqual([2, 3, 1]);
    });

    it('should order by callback in ascending order by default', () => {
      const result = Query.from(users)
        .select('name')
        .orderBy((user) => user.name)
        .column();

      expect(result).toEqual(['Bob', 'John', 'Mary']);
    });

    it('should order by callback in ascending order when it is specified', () => {
      const result = Query.from(users)
        .select('name')
        .orderBy((user) => user.name)
        .column();

      expect(result).toEqual(['Bob', 'John', 'Mary']);
    });

    it('should order by callback in descending order when it is specified', () => {
      const result = Query.from(users)
        .select('name')
        .orderBy((user) => user.name, 'desc')
        .column();

      expect(result).toEqual(['Mary', 'John', 'Bob']);
    });

    it('should keep original order if no argument is specified', () => {
      const result = Query.from(users).select('name').orderBy().column();

      expect(result).toEqual(['John', 'Mary', 'Bob']);
    });
  });
});
