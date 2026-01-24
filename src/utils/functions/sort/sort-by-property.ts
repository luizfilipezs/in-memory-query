export function sortByProperty(property: string) {
  let sortOrder = 1;

  if (property.startsWith('-')) {
    sortOrder = -1;
    property = property.substring(1);
  }

  return <T1 extends object, T2 extends object>(a: T1, b: T2) => {
    const result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

    return result * sortOrder;
  };
}
