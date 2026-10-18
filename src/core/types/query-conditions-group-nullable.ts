import type { NonFunctionKeys } from '../../utils/types/non-function-keys';
import type { PropertyOnly } from '../../utils/types/property-only';
import type { ComparisonOperators } from './comparison-operators';
import type { NullableCondition } from './nullable-condition';
import type { WhereCondition } from './where-condition';

export type QueryConditionsGroupNullable<T extends object> =
  NonFunctionKeys<T> extends never
    ? never
    : {
        [P in keyof PropertyOnly<T>]?: T[P] extends object
          ? QueryConditionsGroupNullable<T[P]> | ComparisonOperators<T[P]>
          : NullableCondition<T[P]>;
      } & {
        $or?: WhereCondition<T>[] | undefined;
      };
