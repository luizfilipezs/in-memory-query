import { sortByProperty } from '../sort-by-property';
import * as sortValuesModule from '../sort-values';

interface TestEntity {
  id: number;
  name: string;
  age?: number | null;
}

describe('sortByProperty', () => {
  const data: TestEntity[] = [
    { id: 3, name: 'Charlie', age: 30 },
    { id: 1, name: 'Alice', age: null },
    { id: 2, name: 'Bob', age: 25 },
  ];

  describe('ascending sort (default)', () => {
    it('should sort by numeric property ascending', () => {
      const result = [...data].sort(sortByProperty<TestEntity>('id'));

      expect(result.map((x) => x.id)).toEqual([1, 2, 3]);
    });

    it('should sort by string property ascending', () => {
      const result = [...data].sort(sortByProperty<TestEntity>('name'));

      expect(result.map((x) => x.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });
  });

  describe('descending sort (prefix "-")', () => {
    it('should sort by numeric property descending', () => {
      const result = [...data].sort(sortByProperty<TestEntity>('-id'));

      expect(result.map((x) => x.id)).toEqual([3, 2, 1]);
    });

    it('should sort by string property descending', () => {
      const result = [...data].sort(sortByProperty<TestEntity>('-name'));

      expect(result.map((x) => x.name)).toEqual(['Charlie', 'Bob', 'Alice']);
    });
  });

  describe('null and undefined handling', () => {
    it('should place null/undefined last in ascending order', () => {
      const result = [...data].sort(sortByProperty<TestEntity>('age'));

      expect(result.map((x) => x.age)).toEqual([25, 30, null]);
    });

    it('should place null/undefined first in descending order', () => {
      const result = [...data].sort(sortByProperty<TestEntity>('-age'));

      expect(result.map((x) => x.age)).toEqual([null, 30, 25]);
    });
  });

  describe('integration with sortValues', () => {
    it('should call sortValues with correct arguments (ascending)', () => {
      const spy = vi.spyOn(sortValuesModule, 'sortValues');

      const sorter = sortByProperty<TestEntity>('id');
      sorter({ id: 1, name: 'A' }, { id: 2, name: 'B' });

      expect(spy).toHaveBeenCalledWith(1, 2, 1);
    });

    it('should call sortValues with correct arguments (descending)', () => {
      const spy = vi.spyOn(sortValuesModule, 'sortValues');

      const sorter = sortByProperty<TestEntity>('-id');
      sorter({ id: 1, name: 'A' }, { id: 2, name: 'B' });

      expect(spy).toHaveBeenCalledWith(1, 2, -1);
    });
  });

  describe('edge cases', () => {
    it('should return 0 when values are equal', () => {
      const sorter = sortByProperty<TestEntity>('id');

      const result = sorter({ id: 1, name: 'A' }, { id: 1, name: 'B' });

      expect(result).toBe(0);
    });

    it('should handle missing properties gracefully (undefined)', () => {
      const sorter = sortByProperty<TestEntity>('age');

      const result = sorter(
        { id: 1, name: 'A' },
        { id: 2, name: 'B', age: 20 }
      );

      expect(result).toBe(1); // undefined treated as null -> goes last in ASC
    });

    it('should work with boolean values', () => {
      const items = [{ value: true }, { value: false }];

      const result = items.sort(sortByProperty<{ value: boolean }>('value'));

      expect(result.map((x) => x.value)).toEqual([false, true]);
    });
  });

  describe('type safety (compile-time)', () => {
    it('does not allow invalid properties', () => {
      type Item = { id: number; name: string };

      // @ts-expect-error
      sortByProperty<Item>('invalid');

      // @ts-expect-error
      sortByProperty<Item>('-invalid');
    });
  });
});
