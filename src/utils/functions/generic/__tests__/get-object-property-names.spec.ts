import { getObjectPropertyNames } from '../get-object-property-names';

class User {
  constructor(
    public id: number,
    public name: string,
    public active: boolean
  ) {}

  isAdmin() {
    return this.id === 1;
  }
}

describe('getObjectPropertyNames', () => {
  it('should return only data properties from a plain object', () => {
    const obj = {
      id: 1,
      name: 'John',
      active: true,
    };

    const result = getObjectPropertyNames(obj);

    expect(result).toEqual(['id', 'name', 'active']);
  });

  it('should exclude function properties', () => {
    const obj = {
      id: 1,
      name: 'John',
      greet: () => 'hello',
    };

    const result = getObjectPropertyNames(obj);

    expect(result).toEqual(['id', 'name']);
  });

  it('should not include class prototype methods', () => {
    const user = new User(1, 'John', true);

    const result = getObjectPropertyNames(user);

    expect(result).toEqual(['id', 'name', 'active']);
    expect(result.includes('isAdmin' as any)).toBe(false);
  });

  it('should return empty array for object with only methods', () => {
    const obj = {
      fn1: () => 1,
      fn2: () => 2,
    };

    const result = getObjectPropertyNames(obj);

    expect(result).toEqual([]);
  });

  it('should return empty array for empty object', () => {
    const obj = {};

    const result = getObjectPropertyNames(obj);

    expect(result).toEqual([]);
  });

  it('should handle mixed value types correctly', () => {
    const obj = {
      str: 'text',
      num: 123,
      bool: true,
      nil: null,
      undef: undefined,
      obj: { nested: true },
      arr: [1, 2, 3],
      fn: () => {},
    };

    const result = getObjectPropertyNames(obj);

    expect(result).toEqual([
      'str',
      'num',
      'bool',
      'nil',
      'undef',
      'obj',
      'arr',
    ]);
  });

  it('should preserve key order', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    const result = getObjectPropertyNames(obj);

    expect(result).toEqual(['a', 'b', 'c']);
  });
});
