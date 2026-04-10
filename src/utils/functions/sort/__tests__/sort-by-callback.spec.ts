import { describe, expect, it, vi } from 'vitest';
import { sortByCallback } from '../sort-by-callback';
import * as sortValuesModule from '../sort-values';

type SortOrder = 1 | -1;

interface TestEntity {
  id: number;
  name: string;
  age?: number | null;
}

describe('sortByCallback', () => {
  const ASC: SortOrder = 1;
  const DESC: SortOrder = -1;

  const data: TestEntity[] = [
    { id: 3, name: 'Charlie', age: 30 },
    { id: 1, name: 'Alice', age: null },
    { id: 2, name: 'Bob', age: 25 },
  ];

  describe('ascending order', () => {
    it('should sort by numeric value from callback', () => {
      const result = [...data].sort(sortByCallback((x) => x.id, ASC));

      expect(result.map((x) => x.id)).toEqual([1, 2, 3]);
    });

    it('should sort by string value from callback', () => {
      const result = [...data].sort(sortByCallback((x) => x.name, ASC));

      expect(result.map((x) => x.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });
  });

  describe('descending order', () => {
    it('should sort by numeric value descending', () => {
      const result = [...data].sort(sortByCallback((x) => x.id, DESC));

      expect(result.map((x) => x.id)).toEqual([3, 2, 1]);
    });

    it('should sort by string value descending', () => {
      const result = [...data].sort(sortByCallback((x) => x.name, DESC));

      expect(result.map((x) => x.name)).toEqual(['Charlie', 'Bob', 'Alice']);
    });
  });

  describe('null and undefined handling', () => {
    it('should place null/undefined last in ascending order', () => {
      const result = [...data].sort(sortByCallback((x) => x.age, ASC));

      expect(result.map((x) => x.age)).toEqual([25, 30, null]);
    });

    it('should place null/undefined first in descending order', () => {
      const result = [...data].sort(sortByCallback((x) => x.age, DESC));

      expect(result.map((x) => x.age)).toEqual([null, 30, 25]);
    });
  });

  describe('callback behavior', () => {
    it('should call callback for both elements', () => {
      const callback = vi.fn((x: TestEntity) => x.id);

      const sorter = sortByCallback(callback, ASC);
      sorter(data[0]!, data[1]!);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(data[0]);
      expect(callback).toHaveBeenCalledWith(data[1]);
    });

    it('should pass correct values to sortValues', () => {
      const spy = vi.spyOn(sortValuesModule, 'sortValues');

      const sorter = sortByCallback<TestEntity>((x) => x.id, DESC);
      sorter({ id: 1, name: 'A' }, { id: 2, name: 'B' });

      expect(spy).toHaveBeenCalledWith(1, 2, -1);
    });
  });

  describe('edge cases', () => {
    it('should return 0 when callback returns equal values', () => {
      const sorter = sortByCallback<TestEntity>(() => 1, ASC);

      const result = sorter({ id: 1, name: 'A' }, { id: 2, name: 'B' });

      expect(result).toBe(0);
    });

    it('should handle undefined values from callback', () => {
      const sorter = sortByCallback<TestEntity>((x) => x.age, ASC);

      const result = sorter(
        { id: 1, name: 'A' },
        { id: 2, name: 'B', age: 20 }
      );

      expect(result).toBe(1);
    });

    it('should work with boolean values', () => {
      const items = [{ value: true }, { value: false }];

      const result = items.sort(
        sortByCallback<{ value: boolean }>((x) => x.value, ASC)
      );

      expect(result.map((x) => x.value)).toEqual([false, true]);
    });

    it('should handle non-comparable values (objects)', () => {
      const sorter = sortByCallback<{ obj: object }>((x) => x.obj, ASC);

      const result = sorter({ obj: {} }, { obj: {} });

      expect(result).toBe(0);
    });

    it('should handle NaN values', () => {
      const sorter = sortByCallback<{}>((x) => x, ASC);

      expect(sorter(NaN as any, 1 as any)).toBe(0);
      expect(sorter(1 as any, NaN as any)).toBe(0);
    });
  });
});
