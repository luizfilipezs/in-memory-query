/**
 * Compares two arrays.
 *
 * @param a First array to compare.
 * @param b Second array to compare.
 *
 * @returns Validation result.
 */
export const compareArrays = <T1, T2>(a: T2[], b: T2[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);
