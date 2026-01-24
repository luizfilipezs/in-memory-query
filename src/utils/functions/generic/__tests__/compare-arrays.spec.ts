import { compareArrays } from '../compare-arrays';

describe('compareArrays', () => {
  it('returns true for ly equal arrays', () => {
    const a = [{ x: 1 }, { y: 2 }];
    const b = [{ x: 1 }, { y: 2 }];

    expect(compareArrays(a, b)).toBe(true);
  });

  it('returns false for ly different arrays', () => {
    expect(compareArrays([{ x: 1 }], [{ x: 2 }])).toBe(false);
  });

  it('returns false when order differs', () => {
    expect(compareArrays([{ a: 1 }, { b: 2 }], [{ b: 2 }, { a: 1 }])).toBe(
      false
    );
  });

  it('works with nested objects', () => {
    const a = [{ x: { y: 1 } }];
    const b = [{ x: { y: 1 } }];

    expect(compareArrays(a, b)).toBe(true);
  });
});
