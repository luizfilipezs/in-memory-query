import { InvalidArgumentError } from '../invalid-argument-error';

describe('InvalidArgumentError', () => {
  it('should be an instance of Error', () => {
    const error = new InvalidArgumentError({
      method: 'testMethod',
      param: 'value',
      argument: 123,
      expected: 'a string',
    });

    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const error = new InvalidArgumentError({
      method: 'testMethod',
      param: 'value',
      argument: 123,
      expected: 'a string',
    });

    expect(error.name).toBe('InvalidArgumentError');
  });

  it('should generate the correct error message', () => {
    const error = new InvalidArgumentError({
      method: 'doSomething',
      param: 0,
      argument: false,
      expected: 'a boolean',
    });

    expect(error.message).toBe(
      'false is not a valid argument to param 0 on doSomething(). It should be a boolean.'
    );
  });

  it('should expose configuration properties', () => {
    const config = {
      method: 'save',
      param: 'id',
      argument: null,
      expected: 'a non-null value',
    };

    const error = new InvalidArgumentError(config);

    expect(error.method).toBe(config.method);
    expect(error.param).toBe(config.param);
    expect(error.argument).toBe(config.argument);
    expect(error.expected).toBe(config.expected);
  });

  it('should preserve prototype chain', () => {
    const error = new InvalidArgumentError({
      method: 'run',
      param: 'options',
      argument: {},
      expected: 'a valid options object',
    });

    expect(error instanceof InvalidArgumentError).toBe(true);
  });
});
