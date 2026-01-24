/**
 * Determines if the given value is a number.
 *
 * @param value The value to check.
 *
 * @returns Validation result.
 */
export const isNumber = (value: unknown): value is number =>
  typeof value === 'number';
