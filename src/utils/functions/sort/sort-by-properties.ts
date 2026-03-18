import { sortByProperty } from '.';
import type {
  addPrefixToObject,
  PropertyOnly,
  PropOf,
  SortFunction,
} from '../../types';

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
