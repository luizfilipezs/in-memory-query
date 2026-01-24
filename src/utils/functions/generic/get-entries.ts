type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export function getEntries<T extends Record<PropertyKey, unknown>>(
  obj: T
): Entries<T> {
  const entries: Entries<T> = [];

  for (const key of Object.keys(obj)) {
    entries.push([key as keyof T, obj[key as keyof T]]);
  }

  return entries;
}
