import type { PropOf } from '../../types';

export function getObjectPropertyNames<T extends object>(obj: T): PropOf<T>[] {
  return Object.keys(obj).filter(
    (key) => typeof obj[key as keyof T] !== 'function'
  ) as PropOf<T>[];
}
