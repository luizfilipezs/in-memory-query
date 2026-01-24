/**
 * Determines if the given value is a function.
 *
 * @param value The value to check.
 *
 * @returns Validation result.
 */
export const isFunction = (value: any): value is (...args: any[]) => any =>
  typeof value === 'function';
