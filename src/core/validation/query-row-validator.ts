import { compareArrays } from '../../utils/functions/generic/compare-arrays';
import { deepEqual } from '../../utils/functions/generic/deep-equal';
import { getEntries } from '../../utils/functions/generic/get-entries';
import { isFunction } from '../../utils/functions/type-guards/is-function';
import { isObject } from '../../utils/functions/type-guards/is-object';
import type { AttributeValidationFunction } from '../types/attribute-validation-function';
import type { ColumnCondition } from '../types/column-condition';
import type { QueryConditionsGroupNullable } from '../types/query-conditions-group-nullable';
import type { ValidationOptions } from '../types/validation-options';
import type { WhereCondition } from '../types/where-condition';

/**
 * Validates a row in the query.
 */
export class QueryRowValidator {
  /**
   * Validates all conditions of the row.
   *
   * @returns Validation result.
   */
  static validate<T extends object>(
    row: T,
    condition: WhereCondition<T>,
    options?: ValidationOptions
  ): boolean {
    options = {
      ignoreNullValues: false,
      ...options,
    };

    if (isFunction(condition)) {
      return condition(row);
    }

    for (const [propName, propCondition] of getEntries(condition)) {
      if (
        options.ignoreNullValues &&
        (propCondition === null || propCondition === undefined)
      ) {
        continue;
      }

      if (propName === '$or') {
        if (Array.isArray(propCondition)) {
          const conditions = propCondition as WhereCondition<T>[];

          if (
            conditions.length > 0 &&
            !conditions.some((cond) => this.validate(row, cond, options))
          ) {
            return false;
          }
        }

        continue;
      }

      if (propName === '$not') {
        if (this.validate(row, propCondition as WhereCondition<T>, options)) {
          return false;
        }

        continue;
      }

      const key = propName as unknown as keyof T;
      const propValue = row[key];

      if (
        !this.validateValue(
          propValue,
          propCondition as ColumnCondition<T, typeof key>,
          options
        )
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate a condition for a row column.
   *
   * @param columnName Column name.
   * @param condition Condition to be validated.
   *
   * @returns Validation result.
   */
  private static validateValue<T extends object, K extends keyof T>(
    value: T[K],
    condition: ColumnCondition<T, K>,
    options: ValidationOptions
  ): boolean {
    if (isFunction(condition)) {
      return (condition as AttributeValidationFunction<T, K>)(value);
    }

    if (Array.isArray(condition)) {
      return Array.isArray(value) ? compareArrays(value, condition) : false;
    }

    if (isObject(condition)) {
      if ('$in' in condition) {
        const inValues = (condition as { $in?: unknown[] }).$in;

        if (Array.isArray(inValues)) {
          return inValues.some((inVal) => deepEqual(value, inVal));
        }

        if (
          options.ignoreNullValues &&
          (inValues === null || inValues === undefined)
        ) {
          return true;
        }

        return false;
      }

      return isObject(value)
        ? this.validate(
            value,
            condition as QueryConditionsGroupNullable<object>,
            options
          )
        : false;
    }

    return value === condition;
  }
}
