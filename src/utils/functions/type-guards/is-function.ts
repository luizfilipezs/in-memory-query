/**
 * Determines if the given value is a function.
 *
 * @param value The value to check.
 *
 * @returns Validation result.
 */
export const isFunction = <T>(value: unknown): value is T =>
  typeof value === 'function';
