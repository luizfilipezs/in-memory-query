/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Determines if the given value is a function.
 *
 * @param value The value to check.
 *
 * @returns Validation result.
 *
 */
export const isFunction = (
  value: unknown
): value is (...args: any[]) => unknown => typeof value === 'function';
