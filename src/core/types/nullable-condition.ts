import type { ComparisonOperators } from './comparison-operators';

export type NullableCondition<T> =
  T | ((value: T) => boolean) | ComparisonOperators<T> | null | undefined;
