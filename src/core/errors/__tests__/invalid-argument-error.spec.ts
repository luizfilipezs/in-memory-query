import { InvalidArgumentError } from '../invalid-argument-error';

describe('InvalidArgumentError', () => {
  it('should be an instance of Error', () => {
    const error = new InvalidArgumentError('Test error');

    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const error = new InvalidArgumentError('Test error');

    expect(error.name).toBe('InvalidArgumentError');
  });

  it('should have the correct message', () => {
    const error = new InvalidArgumentError('Test error');

    expect(error.message).toBe('Test error');
  });
});
