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
        if (!Array.isArray(propCondition)) {
          return false;
        }

        const conditions = propCondition as WhereCondition<T>[];

        if (
          conditions.length > 0 &&
          !conditions.some((cond) => this.validate(row, cond, options))
        ) {
          return false;
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
      let isOperatorMatch = false;

      if ('$in' in condition) {
        isOperatorMatch = true;
        const inValues = (condition as { $in?: unknown[] }).$in;

        if (Array.isArray(inValues)) {
          if (!inValues.some((inVal) => deepEqual(value, inVal))) {
            return false;
          }
        } else if (
          !options.ignoreNullValues ||
          (inValues !== null && inValues !== undefined)
        ) {
          return false;
        }
      }

      if ('$nin' in condition) {
        isOperatorMatch = true;
        const ninValues = (condition as { $nin?: unknown[] }).$nin;

        if (Array.isArray(ninValues)) {
          if (ninValues.some((ninVal) => deepEqual(value, ninVal))) {
            return false;
          }
        } else if (
          !options.ignoreNullValues ||
          (ninValues !== null && ninValues !== undefined)
        ) {
          return false;
        }
      }

      if ('$not' in condition) {
        isOperatorMatch = true;
        const notCondition = (condition as { $not?: unknown }).$not;

        if (
          !options.ignoreNullValues ||
          (notCondition !== null && notCondition !== undefined)
        ) {
          if (
            this.validateValue(
              value,
              notCondition as ColumnCondition<T, K>,
              options
            )
          ) {
            return false;
          }
        }
      }

      const compareRelational = (
        a: unknown,
        b: unknown,
        operator: '$gt' | '$gte' | '$lt' | '$lte'
      ): boolean => {
        if (a == null || b == null) {
          return false;
        }

        const normA =
          a instanceof Date
            ? a.getTime()
            : typeof a === 'number' ||
                typeof a === 'string' ||
                typeof a === 'bigint' ||
                typeof a === 'boolean'
              ? a
              : null;

        const normB =
          b instanceof Date
            ? b.getTime()
            : typeof b === 'number' ||
                typeof b === 'string' ||
                typeof b === 'bigint' ||
                typeof b === 'boolean'
              ? b
              : null;

        if (normA == null || normB == null) {
          return false;
        }

        if (operator === '$gt') return normA > normB;
        if (operator === '$gte') return normA >= normB;
        if (operator === '$lt') return normA < normB;
        return normA <= normB;
      };

      if ('$gt' in condition) {
        isOperatorMatch = true;
        const target = (condition as { $gt?: unknown }).$gt;

        if (
          !options.ignoreNullValues ||
          (target !== null && target !== undefined)
        ) {
          if (!compareRelational(value, target, '$gt')) {
            return false;
          }
        }
      }

      if ('$gte' in condition) {
        isOperatorMatch = true;
        const target = (condition as { $gte?: unknown }).$gte;

        if (
          !options.ignoreNullValues ||
          (target !== null && target !== undefined)
        ) {
          if (!compareRelational(value, target, '$gte')) {
            return false;
          }
        }
      }

      if ('$lt' in condition) {
        isOperatorMatch = true;
        const target = (condition as { $lt?: unknown }).$lt;

        if (
          !options.ignoreNullValues ||
          (target !== null && target !== undefined)
        ) {
          if (!compareRelational(value, target, '$lt')) {
            return false;
          }
        }
      }

      if ('$lte' in condition) {
        isOperatorMatch = true;
        const target = (condition as { $lte?: unknown }).$lte;

        if (
          !options.ignoreNullValues ||
          (target !== null && target !== undefined)
        ) {
          if (!compareRelational(value, target, '$lte')) {
            return false;
          }
        }
      }

      if ('$ne' in condition) {
        isOperatorMatch = true;
        const target = (condition as { $ne?: unknown }).$ne;

        if (
          !options.ignoreNullValues ||
          (target !== null && target !== undefined)
        ) {
          if (deepEqual(value, target)) {
            return false;
          }
        }
      }

      if (isOperatorMatch) {
        return true;
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
