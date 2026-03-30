// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
