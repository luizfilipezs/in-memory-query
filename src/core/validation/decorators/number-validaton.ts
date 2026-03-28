import { isNumber } from '../../../utils/functions/type-guards';
import { InvalidArgumentError } from '../../errors';

interface ParameterConfig {
  index: number;
  min?: number;
  max?: number;
  integer?: boolean;
}

const metadata = new WeakMap<object, Map<string | symbol, ParameterConfig[]>>();

function getParams(
  target: object,
  propertyKey: string | symbol
): ParameterConfig[] {
  let methods = metadata.get(target);

  if (!methods) {
    methods = new Map();
    metadata.set(target, methods);
  }

  let params = methods.get(propertyKey);

  if (!params) {
    params = [];
    methods.set(propertyKey, params);
  }

  return params;
}

export function min(value: number) {
  return function (
    target: object,
    propertyKey: string | symbol,
    index: number
  ): void {
    const params = getParams(target, propertyKey);

    const existing = params.find((p) => p.index === index);

    if (existing) {
      existing.min = value;
    } else {
      params.push({ index, min: value });
    }
  };
}

export function max(value: number) {
  return function (
    target: object,
    propertyKey: string | symbol,
    index: number
  ): void {
    const params = getParams(target, propertyKey);

    const existing = params.find((p) => p.index === index);

    if (existing) {
      existing.max = value;
    } else {
      params.push({ index, max: value });
    }
  };
}

export function integer(
  target: object,
  propertyKey: string | symbol,
  index: number
): void {
  const params = getParams(target, propertyKey);

  const existing = params.find((p) => p.index === index);

  if (existing) {
    existing.integer = true;
  } else {
    params.push({ index, integer: true });
  }
}

export function validateNumbers(
  target: object,
  propertyKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptor: TypedPropertyDescriptor<any>
): void {
  const original = descriptor.value! as (...args: unknown[]) => void;

  descriptor.value = function (...args: unknown[]): void {
    const params = metadata.get(target)?.get(propertyKey) ?? [];

    for (const rule of params) {
      const value = args[rule.index];

      // MIN
      if (rule.min !== undefined) {
        if (!isNumber(value) || value < rule.min) {
          throw new InvalidArgumentError(
            `${String(value)} is not a valid argument to param ${rule.index} on ${propertyKey}(). ` +
              `Expected value to be equal or greater than ${rule.min}.`
          );
        }
      }

      // MAX
      if (rule.max !== undefined) {
        if (!isNumber(value) || value > rule.max) {
          throw new InvalidArgumentError(
            `${String(value)} is not a valid argument to param ${rule.index} on ${propertyKey}(). ` +
              `Expected value to be equal or less than ${rule.max}.`
          );
        }
      }

      // INTEGER
      if (rule.integer) {
        if (!Number.isSafeInteger(value)) {
          throw new InvalidArgumentError(
            `${String(value)} is not a valid argument to param ${rule.index} on ${propertyKey}(). ` +
              `Expected value to be an integer.`
          );
        }
      }
    }

    return original.apply(this, args);
  };
}
