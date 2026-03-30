import type { PropertyOnly } from './property-only';

export type PartialOfProperties<T extends object> = Partial<PropertyOnly<T>>;
