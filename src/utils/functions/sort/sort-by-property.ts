import type {
  addPrefixToObject,
  PropertyOnly,
  PropOf,
  SortFunction,
} from '../../types';

export function sortByProperty<T extends object>(
  property: PropOf<T> | keyof addPrefixToObject<PropertyOnly<T>, '-'>
): SortFunction<T> {
  let sortOrder: 1 | -1 = 1;
  let prop = property as string;

  if (prop.startsWith('-')) {
    sortOrder = -1;
    prop = prop.slice(1);
  }

  const key = prop as keyof T;

  return (a: T, b: T): number => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1 * sortOrder;
    if (valueB == null) return -1 * sortOrder;

    if (valueA < valueB) return -1 * sortOrder;
    if (valueA > valueB) return 1 * sortOrder;

    return 0;
  };
}
