import type { NotTuple } from '../../utils/types/not-tuple';

export type ArraySource<T> = Array<T> | Iterable<NotTuple<T>>;
