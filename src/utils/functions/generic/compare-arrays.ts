import { deepEqual } from './deep-equal';

export const compareArrays = <T>(a: T[], b: T[]): boolean =>
  a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
