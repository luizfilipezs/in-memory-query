import type { NonFunctionKeys } from '../../utils/types/non-function-keys';
import type { PropertyOnly } from '../../utils/types/property-only';
import type { ComparisonOperators } from './comparison-operators';
import type { NullableCondition } from './nullable-condition';
import type { WhereCondition } from './where-condition';

export type QueryConditionsGroupNullable<T extends object> =
  NonFunctionKeys<T> extends never
    ? never
    : {
        [P in keyof PropertyOnly<T>]?: NonNullable<T[P]> extends object
          ? | (QueryConditionsGroupNullable<NonNullable<T[P]>> &
                ComparisonOperators<NonNullable<T[P]>>)
            | ComparisonOperators<NonNullable<T[P]>>
            | NullableCondition<T[P]>
          : NullableCondition<T[P]>;
      } & {
        $or?: WhereCondition<T>[] | null | undefined;
        $not?: WhereCondition<T> | null | undefined;
      };
