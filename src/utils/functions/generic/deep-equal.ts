import { isObject } from '../type-guards';

export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) {
    return true;
  }

  if (!isObject(a) || !isObject(b)) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
  );
};
