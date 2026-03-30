/* eslint-disable @typescript-eslint/no-explicit-any */

export type NonFunctionKeys<T extends object> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];
