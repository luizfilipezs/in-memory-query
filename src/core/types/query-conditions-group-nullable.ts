import type { PropertyOnly } from '../../utils/types';
import type { NullableCondition } from './nullable-condition';

export type QueryConditionsGroupNullable<T extends object> = {
  [P in keyof PropertyOnly<T>]?: T[P] extends object
    ? QueryConditionsGroupNullable<T[P]>
    : NullableCondition<T[P]>;
};
