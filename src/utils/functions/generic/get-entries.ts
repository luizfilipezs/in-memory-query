/**
 * Returns the entries of an object.
 *
 * @param obj The object to retrieve entries.
 *
 * @returns The entries of the object.
 */
export const getEntries = <T extends object>(obj: T): [[keyof T, T[keyof T]]] =>
  Object.entries(obj) as [[keyof T, T[keyof T]]];
