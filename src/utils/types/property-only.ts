import type { NonFunctionKeys } from './non-function-keys';

export type PropertyOnly<T extends object> = {
  [P in NonFunctionKeys<T>]: T[P];
};
