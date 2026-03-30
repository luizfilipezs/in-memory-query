import type { addPrefixToObject } from '../../types/add-prefix-to-object';
import type { PropOf } from '../../types/prop-of';
import type { PropertyOnly } from '../../types/property-only';
import type { SortFunction } from '../../types/sort-function';
import { sortByProperty } from './sort-by-property';

export function sortByProperties<T extends object>(
  ...props: (PropOf<T> | keyof addPrefixToObject<PropertyOnly<T>, '-'>)[]
): SortFunction<T> {
  return (a: T, b: T): number => {
    if (props.length === 0) {
      return 0;
    }

    for (const prop of props) {
      const result = sortByProperty<T>(prop)(a, b);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  };
}
