import type { AttributeValidationFunction } from './attribute-validation-function';
import type { ComparisonOperators } from './comparison-operators';
import type { QueryConditionsGroupNullable } from './query-conditions-group-nullable';

/**
 * Condition to apply to a row column.
 */
export type ColumnCondition<T extends object, P extends keyof T> =
  NonNullable<T[P]> extends object
    ? | (QueryConditionsGroupNullable<NonNullable<T[P]>> &
          ComparisonOperators<NonNullable<T[P]>>)
      | ComparisonOperators<NonNullable<T[P]>>
      | T[P]
      | AttributeValidationFunction<T, P>
      | null
      | undefined
    : | T[P]
      | AttributeValidationFunction<T, P>
      | ComparisonOperators<T[P]>
      | null
      | undefined;
