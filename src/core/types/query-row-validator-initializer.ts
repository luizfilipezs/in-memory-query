import type { QueryConditionsGroupNullable } from './query-conditions-group-nullable';

/**
 * Validator configuration.
 */
export interface QueryRowValidatorInitializer<T extends object> {
  conditionsObject: QueryConditionsGroupNullable<T>;
  ignoreNullValues: boolean;
}
