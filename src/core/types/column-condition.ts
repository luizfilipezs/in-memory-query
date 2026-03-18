import type { AttributeValidationFunction } from './attribute-validation-function';
import type { QueryConditionsGroupNullable } from './query-conditions-group-nullable';

/**
 * Condition to apply to a row column.
 */
export type ColumnCondition<
  T extends object,
  P extends keyof T,
> = T[P] extends object
  ? QueryConditionsGroupNullable<T[P]> | undefined
  : T[P] | AttributeValidationFunction<T, P> | null | undefined;
