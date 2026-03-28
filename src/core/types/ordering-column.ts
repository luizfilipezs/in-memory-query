import type {
  addPrefixToObject,
  PropertyOnly,
  PropOf,
} from '../../utils/types';

export type OrderingColumn<T extends object> =
  | PropOf<T>
  | keyof addPrefixToObject<PropertyOnly<T>, '-'>;
