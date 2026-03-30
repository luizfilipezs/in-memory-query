import type { PropertyOnly } from './property-only';

/**
 * Represents a property of a class or interface.
 */
export type PropOf<T extends object> = keyof PropertyOnly<T>;
