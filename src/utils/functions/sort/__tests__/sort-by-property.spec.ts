import { sortByProperty } from '../sort-by-property';

describe('sortByProperty (improved)', () => {
  describe('ascending order', () => {
    it('sorts by numeric property', () => {
      const data = [{ id: 3 }, { id: 1 }, { id: 2 }];

      data.sort(sortByProperty<(typeof data)[number]>('id'));

      expect(data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('sorts by string property', () => {
      const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];

      data.sort(sortByProperty<(typeof data)[number]>('name'));

      expect(data).toEqual([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ]);
    });
  });

  describe('descending order', () => {
    it('sorts by numeric property descending', () => {
      const data = [{ score: 10 }, { score: 30 }, { score: 20 }];

      data.sort(sortByProperty<(typeof data)[number]>('-score'));

      expect(data).toEqual([{ score: 30 }, { score: 20 }, { score: 10 }]);
    });

    it('sorts by string property descending', () => {
      const data = [{ name: 'Alice' }, { name: 'Charlie' }, { name: 'Bob' }];

      data.sort(sortByProperty<(typeof data)[number]>('-name'));

      expect(data).toEqual([
        { name: 'Charlie' },
        { name: 'Bob' },
        { name: 'Alice' },
      ]);
    });
  });

  describe('null and undefined handling', () => {
    it('places undefined values last', () => {
      const data = [{ value: 2 }, { value: undefined }, { value: 1 }];

      data.sort(sortByProperty<(typeof data)[number]>('value'));

      expect(data).toEqual([{ value: 1 }, { value: 2 }, { value: undefined }]);
    });

    it('places null values last', () => {
      const data = [{ value: 2 }, { value: null }, { value: 1 }];

      data.sort(sortByProperty<(typeof data)[number]>('value'));

      expect(data).toEqual([{ value: 1 }, { value: 2 }, { value: null }]);
    });

    it('returns 0 when both values are null', () => {
      const comparator = sortByProperty<{ value: number | null }>('value');

      expect(comparator({ value: null }, { value: null })).toBe(0);
    });

    it('returns 0 when both values are undefined', () => {
      const comparator = sortByProperty<{ value?: number | undefined }>(
        'value'
      );

      expect(comparator({ value: undefined }, { value: undefined })).toBe(0);
    });

    it('returns 0 when both values are nullish (null vs undefined)', () => {
      const comparator = sortByProperty<{ value: number | null | undefined }>(
        'value'
      );

      expect(comparator({ value: null }, { value: undefined })).toBe(0);
      expect(comparator({ value: undefined }, { value: null })).toBe(0);
    });
  });

  describe('equal values', () => {
    it('returns 0 for equal property values', () => {
      const comparator = sortByProperty<{ id: number }>('id');

      expect(comparator({ id: 1 }, { id: 1 })).toBe(0);
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
