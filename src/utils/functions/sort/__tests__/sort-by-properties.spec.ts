import { sortByProperties } from '../sort-by-properties';

describe('sortByProperties', () => {
  type Item = {
    id: number;
    name: string;
    age?: number;
  };

  it('sorts by a single property', () => {
    const data: Item[] = [
      { id: 2, name: 'B' },
      { id: 1, name: 'A' },
    ];

    data.sort(sortByProperties<Item>('id'));

    expect(data).toEqual([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ]);
  });

  it('sorts by multiple properties in order', () => {
    const data: Item[] = [
      { id: 1, name: 'Bob', age: 30 },
      { id: 2, name: 'Alice', age: 30 },
      { id: 3, name: 'Alice', age: 25 },
    ];

    data.sort(sortByProperties<Item>('name', 'age'));

    expect(data).toEqual([
      { id: 3, name: 'Alice', age: 25 },
      { id: 2, name: 'Alice', age: 30 },
      { id: 1, name: 'Bob', age: 30 },
    ]);
  });

  it('supports descending order with "-" prefix', () => {
    const data: Item[] = [
      { id: 1, name: 'Bob', age: 30 },
      { id: 2, name: 'Alice', age: 30 },
      { id: 3, name: 'Alice', age: 25 },
    ];

    data.sort(sortByProperties<Item>('name', '-age'));

    expect(data).toEqual([
      { id: 2, name: 'Alice', age: 30 },
      { id: 3, name: 'Alice', age: 25 },
      { id: 1, name: 'Bob', age: 30 },
    ]);
  });

  it('places undefined values last when used as secondary key', () => {
    const data: Item[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Alice', age: 20 },
      { id: 3, name: 'Alice', age: 10 },
    ];

    data.sort(sortByProperties<Item>('name', 'age'));

    expect(data).toEqual([
      { id: 3, name: 'Alice', age: 10 },
      { id: 2, name: 'Alice', age: 20 },
      { id: 1, name: 'Alice' },
    ]);
  });

  it('returns 0 when all compared properties are equal', () => {
    const comparator = sortByProperties<Item>('name', 'age');

    expect(
      comparator(
        { id: 1, name: 'Alice', age: 20 },
        { id: 2, name: 'Alice', age: 20 }
      )
    ).toBe(0);
  });

  it('returns 0 when no properties are provided', () => {
    const comparator = sortByProperties<Item>();

    expect(comparator({ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' })).toBe(
      0
    );
  });

  it('enforces type safety at compile time', () => {
    type Item = { id: number; name: string };

    // @ts-expect-error
    sortByProperties<Item>('invalid');

    // @ts-expect-error
    sortByProperties<Item>('-invalid');
  });
});
