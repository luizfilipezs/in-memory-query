export type AttributeValidationFunction<
  T extends object,
  P extends keyof T = keyof T,
> = (value: T[P]) => boolean;
