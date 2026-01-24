/**
 * Compares two arrays.
 *
 * @param a First array to compare.
 * @param b Second array to compare.
 *
 * @returns Validation result.
 */
export const compareArrays = (a: any[], b: any[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);
