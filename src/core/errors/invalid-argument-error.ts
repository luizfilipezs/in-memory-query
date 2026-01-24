interface InvalidArgumentErrorConfig {
  method: string;
  param: string | number;
  argument: unknown;
  expected: string;
}

export class InvalidArgumentError extends Error {
  public readonly method: string;
  public readonly param: string | number;
  public readonly argument: unknown;
  public readonly expected: string;

  constructor({
    method,
    param,
    argument,
    expected,
  }: InvalidArgumentErrorConfig) {
    super(
      `${String(argument)} is not a valid argument to param ${param} on ${method}(). ` +
        `It should be ${expected}.`
    );

    this.name = 'InvalidArgumentError';
    this.method = method;
    this.param = param;
    this.argument = argument;
    this.expected = expected;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
