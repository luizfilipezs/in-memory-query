import { compareArrays } from '../../utils/functions/generic/compare-arrays';
import { getEntries } from '../../utils/functions/generic/get-entries';
import { isFunction } from '../../utils/functions/type-guards/is-function';
import { isObject } from '../../utils/functions/type-guards/is-object';
import type { AttributeValidationFunction } from '../types/attribute-validation-function';
import type { ColumnCondition } from '../types/column-condition';
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

      const validated = this.validateColumnCondition(
        row,
        propName,
        propCondition
      );

      if (!validated) {
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
  private static validateColumnCondition<
    T extends object,
    TColumn extends keyof T,
  >(row: T, column: TColumn, condition: ColumnCondition<T, TColumn>): boolean {
    const cellValue = row[column];

    if (isFunction(condition)) {
      return (condition as AttributeValidationFunction<T, TColumn>)(cellValue);
    }

    if (Array.isArray(condition)) {
      return Array.isArray(cellValue)
        ? compareArrays(cellValue, condition)
        : false;
    }

    if (isObject(condition)) {
      return isObject(cellValue) ? this.validate(cellValue, condition) : false;
    }

    return cellValue === condition;
  }
}
