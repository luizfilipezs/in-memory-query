import type { addPrefixToObject } from '../../types/add-prefix-to-object';
import type { PropOf } from '../../types/prop-of';
import type { PropertyOnly } from '../../types/property-only';
import type { SortFunction } from '../../types/sort-function';
import type { SortOrder } from '../../types/sort-order';
import { sortValues } from './sort-values';

export function sortByProperty<T extends object>(
  property: PropOf<T> | keyof addPrefixToObject<PropertyOnly<T>, '-'>
): SortFunction<T> {
  let sortOrder: SortOrder = 1;
  let prop = property as string;

  if (prop.startsWith('-')) {
    sortOrder = -1;
    prop = prop.slice(1);
  }

  const key = prop as keyof T;

  return (a: T, b: T): number => {
    const valueA = a[key];
    const valueB = b[key];

    return sortValues(valueA, valueB, sortOrder);
  };
}
