import type { SortOrder } from '../../types/sort-order';

export function sortValues(a: unknown, b: unknown, order: SortOrder): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1 * order;
  if (b == null) return -1 * order;

  if (a < b) return -1 * order;
  if (a > b) return 1 * order;

  return 0;
}
