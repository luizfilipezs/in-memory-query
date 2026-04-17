export type NotTuple<T> = T extends readonly [unknown, unknown] ? never : T;
