import { getEntries } from '../get-entries';

describe('getEntries', () => {
  it('should return entries for a simple object', () => {
    const obj = {
      a: 1,
      b: 2,
    };

    const entries = getEntries(obj);

    expect(entries).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('should return an empty array for an empty object', () => {
    const obj = {};

    const entries = getEntries(obj);

    expect(entries).toEqual([]);
  });

  it('should work with different value types', () => {
    const obj = {
      name: 'Alice',
      age: 30,
      active: true,
    };

    const entries = getEntries(obj);

    expect(entries).toEqual([
      ['name', 'Alice'],
      ['age', 30],
      ['active', true],
    ]);
  });

  it('should preserve key-value association', () => {
    const obj = {
      x: 10,
      y: 20,
    };

    const entries = getEntries(obj);

    for (const [key, value] of entries) {
      expect(obj[key]).toBe(value);
    }
  });

  it('should provide correct typing for keys and values (type-level test)', () => {
    const obj = {
      id: 1,
      title: 'Post',
    };

    const entries = getEntries(obj);

    // Compile-time assertions (no runtime effect)
    type Entry = (typeof entries)[number];

    const key: Entry[0] = 'id';
    const value: Entry[1] = obj[key];

    expect(key).toBe('id');
    expect(value).toBe(1);
  });
});
