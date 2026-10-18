/**
 * Comparison operators for attribute validation.
 */
export type ComparisonOperators<T> = {
  $in?: T[] | undefined;
  $nin?: T[] | undefined;
  $not?: T | ((value: T) => boolean) | ComparisonOperators<T> | undefined;
};
