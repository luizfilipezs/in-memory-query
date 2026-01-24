/**
 * Determines if the given value is an object.
 *
 * @param value The value to check.
 *
 * @returns Validation result.
 */
export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;
