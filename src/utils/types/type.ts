/**
 * Represents a class.
 */
export type Type<T = unknown> = new (...args: unknown[]) => T;
