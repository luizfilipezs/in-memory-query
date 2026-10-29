export type RelationalOperator = '$gt' | '$gte' | '$lt' | '$lte';

/**
 * Compares two values using a relational operator.
 * Supports numbers, dates, strings, booleans, and bigints.
 *
 * @param a First value.
 * @param b Second value.
 * @param operator Relational operator to apply.
 *
 * @returns Whether the condition holds true.
 */
export function compareRelational(
  a: unknown,
  b: unknown,
  operator: RelationalOperator
): boolean {
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
}
