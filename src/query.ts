import type {
  QueryConditionsGroup,
  QueryConditionsGroupNullable,
} from './core/types';
import type { OrderingColumn } from './core/types/ordering-column';
import type { ValidationOptions } from './core/types/validation-options';
import { QueryRowValidator } from './core/validation';
import { integer, min, validateNumbers } from './core/validation/decorators';
import { getObjectPropertyNames } from './utils/functions/generic/get-object-property-names';
import { sortByProperties } from './utils/functions/sort';
import { isFunction } from './utils/functions/type-guards';
import type { PropOf } from './utils/types';

/**
 * Allows filtering data from an array of objects.
 *
 * @example
 * ```ts
 * interface User {
 *   id: string;
 *   email: string;
 *   isActive: boolean;
 *   createdAt: string;
 *   updatedAt: string;
 * }
 *
 * const users: User[] = [];
 *
 * // Filtering objects
 *
 * const activeGmailUsers = Query.from(users)
 *   .where({
 *     isActive: true,
 *     email: (email) => email.endsWith('@gmail.com'),
 *   })
 *   .all();
 *
 * // Selecting specific data
 *
 * const userEmails = Query.from(users)
 *   .select('email')
 *   .column();
 *
 * const lastUserId = Query.from(users)
 *   .select('id')
 *   .orderBy('-createdAt')
 *   .scalar();
 *
 * // Checking information
 *
 * const userExists = Query.from(users)
 *   .where({
 *     id: 'some-id',
 *   })
 *   .exists();
 *
 * const numberOfUsers = Query.from(users).count();
 * ```
 */
export class Query<T extends object> {
  /**
   * Rows to be queried.
   */
  #rows: T[] = [];

  /**
   * Number of results to skip.
   */
  #startAt = 0;

  /**
   * Limit of results.
   */
  #limit: number | null = null;

  /**
   * Initializes the query.
   *
   * @param rows Rows to be queried.
   */
  private constructor(rows: T[]) {
    this.#rows = [...rows];
  }

  /**
   * Creates a new query based on the given data.
   *
   * @param rows Rows to be queried.
   *
   * @returns Query to the given rows.
   */
  static from<T extends object>(rows: T[]): Query<T> {
    return new Query(rows);
  }

  /**
   * Defines specific columns to be returned on the final results.
   *
   * @param columns Selected columns.
   *
   * @returns Current query.
   */
  select<TColumns extends PropOf<T>[]>(
    ...columns: TColumns
  ): Query<{ [P in TColumns[number]]: T[P] }> {
    type _Row = { [P in TColumns[number]]: T[P] };

    // extract selected columns
    const rows: _Row[] = [];

    for (const row of this.#rows) {
      const result = {} as _Row;

      for (const column of columns) {
        result[column] = row[column];
      }

      rows.push(result);
    }

    // create new query
    const query = new Query(rows);
    this.cloneStateInto(query);

    return query;
  }

  /**
   * Maps each row to a new object and returns a new query.
   *
   * @param callback Function to be called for each row.
   * @returns New query with the mapped rows.
   */
  map<TReturn extends object>(callback: (obj: T) => TReturn): Query<TReturn> {
    // map rows
    const rows = [];

    for (const row of this.#rows) {
      rows.push(callback(row));
    }

    // create new query
    const query = new Query(rows);
    this.cloneStateInto(query);

    return query;
  }

  /**
   * Applies conditions to the query.
   *
   * @param condition Filter to be applied to the query.
   *
   * If a callback function is provided, it must return a boolean value.
   *
   * If an object is provided, its properties must be attributes of `T` and their
   * corresponding values must be the expected values for the attributes or a
   * callback functions that return boolean values.
   *
   * @returns Current query.
   */
  where(condition: QueryConditionsGroup<T> | ((obj: T) => boolean)): this {
    this.filterRows(condition);

    return this;
  }

  /**
   * Applies a set of conditions to the query ignoring `null` and `undefined`
   * values as conditions.
   *
   * @param condition An object where each property represents an attribute
   * to be validated. The values can be literal or callback functions that
   * return a boolean. If `null` or `undefined` is passed, that condition
   * will be skipped.
   *
   * @returns Current query.
   */
  filterWhere(condition: QueryConditionsGroupNullable<T>): this {
    this.filterRows(condition, { ignoreNullValues: true });

    return this;
  }

  /**
   * Adds ordering to the results.
   *
   * This method should be called after `select()`; otherwise, the ordering will
   * be applied only to the selected columns.
   *
   * @example
   * ```ts
   * // ❌ "age" will not be ordered, because it is not part of the selected columns
   * const query = Query.from(users)
   *   .orderBy('-age')
   *   .select('name');
   *
   * // ✅ "age" will be ordered
   * const query = Query.from(users)
   *   .select('name', 'age')
   *   .orderBy('-age');
   * ```
   *
   * @param columns Ascending or descending columns. To mark a field as
   * descending, prefix it with `-`.
   *
   * @returns Current query.
   */
  orderBy(...columns: OrderingColumn<T>[]): this {
    this.#rows = this.#rows.sort(sortByProperties(...columns));

    return this;
  }

  /**
   * Defines the number of rows to skip.
   *
   * @param numberOfRows Numbers of rows to skip. Only non negative integer numbers
   * are allowed.
   *
   * @returns Current query.
   *
   * @throws {InvalidArgumentError} If the given number is less than 0.
   */
  @validateNumbers
  skip(@integer @min(0) numberOfRows: number): this {
    this.#startAt = numberOfRows;

    return this;
  }

  /**
   * Defines a limit for the number of results.
   *
   * @param limit Limit of results. Only non negative integer numbers are allowed.
   *
   * @returns Current query.
   *
   * @throws {InvalidArgumentError} If the given limit is less than 0.
   */
  @validateNumbers
  limit(@integer @min(0) limit: number): this {
    this.#limit = limit;

    return this;
  }

  /**
   * Groups the results by a specific key.
   *
   * @param key Key to group by.
   *
   * @returns Grouped results.
   */
  groupBy<K extends keyof T>(key: K): Map<T[K], T[]>;
  /**
   * Groups the results by a specific key.
   *
   * @param key Key to group by.
   * @param mapFn Callback to map each row to a new value.
   *
   * @returns Grouped results.
   */
  groupBy<K extends keyof T, TReturn>(
    key: K,
    mapFn: (row: T) => TReturn
  ): Map<T[K], TReturn[]>;
  /**
   * Groups the results by a callback.
   *
   * @param groupFn Callback to group by.
   *
   * @returns Grouped results.
   */
  groupBy<TGrouper>(groupFn: (row: T) => TGrouper): Map<TGrouper, T[]>;
  /**
   * Groups the results by a callback.
   *
   * @param groupFn Callback to group by.
   *
   * @returns Grouped results.
   */
  groupBy<TGrouper, TReturn>(
    groupFn: (row: T) => TGrouper,
    mapFn: (row: T) => TReturn
  ): Map<TGrouper, TReturn[]>;
  groupBy(
    groupArg: keyof T | ((row: T) => unknown),
    mapArg?: (row: T) => unknown
  ): Map<unknown, unknown[]> {
    const rows = this.getLimitedRows();
    const map = new Map<unknown, unknown[]>();
    const hasCallback = isFunction(groupArg);

    for (const row of rows) {
      const index = hasCallback ? groupArg(row) : row[groupArg];
      const value = mapArg ? mapArg(row) : row;

      if (map.has(index)) {
        map.get(index)!.push(value);
      } else {
        map.set(index, [value]);
      }
    }

    return map;
  }

  /**
   * Returns all results.
   *
   * @returns All filtered rows.
   */
  all(): T[] {
    return this.getLimitedRows();
  }

  /**
   * Returns the first result.
   *
   * @returns The first result.
   */
  first(): T | null {
    const rows = this.getLimitedRows();

    return rows.length > 0 ? rows[0]! : null;
  }

  /**
   * Returns the last result.
   *
   * @returns The last result.
   */
  last(): T | null {
    const rows = this.getLimitedRows();

    return rows[rows.length - 1] ?? null;
  }

  /**
   * Returns the value of the first (selected) column of the first row.
   *
   * @returns First value or `false`, if none row exists.
   */
  scalar(): T[PropOf<T>] | false {
    const firstObject = this.first();
    const firstColumn = this.getFirstColumn();

    return firstObject && firstColumn ? firstObject[firstColumn] : false;
  }

  /**
   * Returns the values of the first (selected) column of all rows.
   *
   * @param column (Optional) The column to get the values from.
   *
   * @returns Values from the first (selected) column.
   */
  column(): T[PropOf<T>][];
  column<TColumn extends PropOf<T>>(column: TColumn): T[TColumn][];
  column(column?: PropOf<T>): T[PropOf<T>][] {
    if (column === undefined) {
      const firstColumn = this.getFirstColumn();

      if (!firstColumn) {
        return [];
      }

      column = firstColumn;
    }

    return this.getLimitedRows().map((row) => row[column]);
  }

  /**
   * Returns the values of the rows. If there are selected columns, only their
   * values will be returned.
   *
   * @returns Array with the values of all rows.
   */
  values(): T[PropOf<T>][][] {
    type _Values = T[PropOf<T>][];

    const rows: _Values[] = [];

    for (const row of this.getLimitedRows()) {
      rows.push(Object.values(row) as _Values);
    }

    return rows;
  }

  /**
   * Returns the current number of rows.
   *
   * @return Filtered rows count.
   */
  count(): number {
    return this.getLimitedRows().length;
  }

  /**
   * Checks if there is at least one row compatible with the query.
   *
   * @returns Whether any row exists after filtering.
   */
  exists(): boolean {
    return this.count() > 0;
  }

  /**
   * Filters the rows according to the given conditions.
   *
   * @param condition Object or callback function.
   */
  private filterRows(
    condition: QueryConditionsGroupNullable<T> | ((obj: T) => boolean),
    options?: ValidationOptions
  ): void {
    const rows = this.#rows;
    const result: T[] = [];

    if (isFunction(condition)) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;

        if (condition(row)) {
          result.push(row);
        }
      }
    } else {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;

        if (QueryRowValidator.validate(row, condition, options)) {
          result.push(row);
        }
      }
    }

    this.#rows = result;
  }

  /**
   * Returns the first selected column or the first key of some row.
   *
   * @returns The first column or `null`, if none is selected  or there is no row.
   */
  private getFirstColumn(): PropOf<T> | null {
    const firstRow = this.first();

    if (!firstRow) {
      return null;
    }

    const columns = getObjectPropertyNames(firstRow);

    if (columns.length > 0) {
      return columns[0]!;
    }

    return null;
  }

  /**
   * Returns the rows that should be used in the final results.
   *
   * @returns Rows within the specified limit.
   */
  private getLimitedRows(): T[] {
    const rows = [...this.#rows];

    return rows.slice(
      this.#startAt,
      this.#startAt + (this.#limit ?? rows.length)
    );
  }

  /**
   * Copies the state of the current query into the given query.
   *
   * @param query Query to copy the state into.
   */
  private cloneStateInto<T extends object>(query: Query<T>): void {
    query.#startAt = this.#startAt;
    query.#limit = this.#limit;
  }
}
