import { BaseObject } from './base-object';
import { QueryConditionsGroupNullable } from './query-conditions-group-nullable';
import { compareArrays, getEntries } from './utils/functions/generic';
import { isFunction, isObject } from './utils/functions/type-guards';

/**
 * Validator configuration.
 */
interface QueryRowValidatorInitializer<T extends object> {
  conditionsObject: QueryConditionsGroupNullable<T>;
  ignoreNullValues: boolean;
}

/**
 * Condition to apply to a row column.
 */
type ColumnCondition<T extends object, P extends keyof T> = T[P] extends object
  ? QueryConditionsGroupNullable<T[P]> | undefined
  : T[P] | ((value: T[P]) => boolean) | null | undefined;

/**
 * Validates a row in the query.
 */
export class QueryRowValidator<T extends object> extends BaseObject {
  /**
   * Row to be validated.
   */
  private row!: T;

  /**
   * Conditions to be applied to the row.
   */
  private conditionsObject!: QueryConditionsGroupNullable<T>;

  /**
   * Indicates whether conditions with `null` and `undefined` values should be
   * skipped.
   */
  private ignoreNullValues!: boolean;

  /**
   * Initializes the validator.
   *
   * @param row Row to validated.
   * @param config Validator configuration.
   */
  private constructor(row: T, config: QueryRowValidatorInitializer<T>) {
    super({ row, ...config });
  }

  /**
   * Validates a row.
   *
   * @param row Row to validated.
   * @param config Validator configuration.
   */
  static validate<T extends object>(
    row: T,
    config: QueryRowValidatorInitializer<T>
  ): boolean {
    const validator = new QueryRowValidator(row, config);

    return validator.validate();
  }

  /**
   * Validates all conditions of the row.
   *
   * @returns Validation result.
   */
  private validate(): boolean {
    const conditionsEntries = getEntries(this.conditionsObject);

    return conditionsEntries.every(([columnName, condition]) =>
      this.validateColumnCondition(columnName, condition)
    );
  }

  /**
   * Validate a condition to a specific column.
   *
   * @param columnName Column name.
   * @param condition Condition to be validated.
   *
   * @returns Validation result.
   */
  private validateColumnCondition<P extends keyof T>(
    columnName: P,
    condition: ColumnCondition<T, P>
  ): boolean {
    if (
      this.ignoreNullValues &&
      (condition === null || condition === undefined)
    ) {
      return true;
    }

    const cellValue = this.row[columnName];

    if (isFunction(condition)) {
      return condition(cellValue);
    }

    if (Array.isArray(condition)) {
      return Array.isArray(cellValue)
        ? compareArrays(cellValue, condition)
        : false;
    }

    if (isObject(condition)) {
      return isObject(cellValue)
        ? this.validateInnerObject(cellValue, condition)
        : false;
    }

    return cellValue === condition;
  }

  /**
   * Validates an object inside the row.
   *
   * @param obj Object to validated.
   * @param conditionsObject Conditions to be applied to the object.
   *
   * @returns Validation result.
   */
  private validateInnerObject<O extends object>(
    obj: O,
    conditionsObject: QueryConditionsGroupNullable<O>
  ): boolean {
    return QueryRowValidator.validate(obj, {
      conditionsObject,
      ignoreNullValues: this.ignoreNullValues,
    });
  }
}
