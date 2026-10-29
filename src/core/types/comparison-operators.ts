/**
 * Comparison operators for attribute validation.
 */
export type ComparisonOperators<T> = {
  $in?: T[] | null | undefined;
  $nin?: T[] | null | undefined;
  $not?:
    T | ((value: T) => boolean) | ComparisonOperators<T> | null | undefined;
  $gt?: T | null | undefined;
  $gte?: T | null | undefined;
  $lt?: T | null | undefined;
  $lte?: T | null | undefined;
  $ne?: T | null | undefined;
};
