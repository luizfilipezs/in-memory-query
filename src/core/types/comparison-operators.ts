/**
 * Comparison operators for attribute validation.
 */
export type ComparisonOperators<T> = {
  $in?: T[] | undefined;
  $nin?: T[] | undefined;
  $not?: T | ((value: T) => boolean) | ComparisonOperators<T> | undefined;
  $gt?: T | undefined;
  $gte?: T | undefined;
  $lt?: T | undefined;
  $lte?: T | undefined;
  $ne?: T | undefined;
};
