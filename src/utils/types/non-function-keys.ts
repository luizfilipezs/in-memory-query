import type { IsFunction } from './is-function';

export type NonFunctionKeys<T extends object> = {
  [K in keyof T]: IsFunction<T[K]> extends true ? never : K;
}[keyof T];
