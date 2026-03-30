export type KeysOfType<T, TValue> = {
  [K in keyof T]: T[K] extends TValue ? K : never;
}[keyof T];
