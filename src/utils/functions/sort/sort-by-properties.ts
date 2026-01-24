import { sortByProperty } from '.';

export function sortByProperties(...props: string[]) {
  return <T1 extends object, T2 extends object>(obj1: T1, obj2: T2) => {
    const numberOfProperties = props.length;
    let result = 0;
    let i = 0;

    while (result === 0 && i < numberOfProperties) {
      result = sortByProperty(props[i])(obj1, obj2);
      i++;
    }

    return result;
  };
}
