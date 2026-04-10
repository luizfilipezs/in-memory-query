import type { SortFunction } from '../../types/sort-function';
import type { SortOrder } from '../../types/sort-order';
import { sortValues } from './sort-values';

export function sortByCallback<T extends object>(
  callback: (item: T) => unknown,
  sortOrder: SortOrder
): SortFunction<T> {
  return (a: T, b: T): number =>
    sortValues(callback(a), callback(b), sortOrder);
}
