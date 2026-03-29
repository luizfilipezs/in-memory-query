import { compareArrays, getEntries } from '../../utils/functions/generic';
import { isFunction, isObject } from '../../utils/functions/type-guards';
import type {
  AttributeValidationFunction,
  QueryConditionsGroupNullable,
} from '../types';
import type { ColumnCondition } from '../types/column-condition';
import type { ValidationOptions } from '../types/validation-options';

/**
 * Validates a row in the query.
 */
export class QueryRowValidator {
  static #defaultOptions: ValidationOptions = {
    ignoreNullValues: false,
  };

  /**
   * Validates all conditions of the row.
   *
   * @returns Validation result.
   */
  static validate<T extends object>(
    row: T,
    condition: QueryConditionsGroupNullable<T>,
    options?: ValidationOptions
  ): boolean {
    for (const [column, columnCondition] of getEntries(condition)) {
      const validated = this.validateColumnCondition(
        row,
        column,
        columnCondition,
        options ?? this.#defaultOptions
      );

      if (!validated) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate a condition to a specific column.
   *
   * @param columnName Column name.
   * @param condition Condition to be validated.
   *
   * @returns Validation result.
   */
  private static validateColumnCondition<
    T extends object,
    TColumn extends keyof T,
  >(
    row: T,
    column: TColumn,
    condition: ColumnCondition<T, TColumn>,
    options: ValidationOptions
  ): boolean {
    if (
      options.ignoreNullValues &&
      (condition === null || condition === undefined)
    ) {
      return true;
    }

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
