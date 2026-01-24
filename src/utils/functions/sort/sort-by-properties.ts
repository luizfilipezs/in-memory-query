import { sortByProperty } from '.';
import { addPrefixToObject, PropertyOnly, PropOf } from '../../types';

export function sortByProperties<T extends object>(
  ...props: Array<PropOf<T> | keyof addPrefixToObject<PropertyOnly<T>, '-'>>
) {
  return (a: T, b: T): number => {
    if (props.length === 0) {
      return 0;
    }

    let result = 0;

    for (const prop of props) {
      result = sortByProperty<T>(prop)(a, b);
      if (result !== 0) {
        return result;
      }
    }

    return 0;
  };
}
