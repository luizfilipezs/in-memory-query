import { InvalidArgumentError } from '../../../errors/invalid-argument-error';
import { integer, max, min, validateNumbers } from '../number-validaton';

class TestService {
  @validateNumbers
  sum(@min(0) a: number, @max(10) b: number, @integer c: number): number {
    return a + b + c;
  }

  @validateNumbers
  onlyInteger(@integer value: number): number {
    return value;
  }

  @validateNumbers
  ranged(@min(5) @max(10) value: number): number {
    return value;
  }
}

describe('number decorators', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  describe('valid scenarios', () => {
    it('should allow valid arguments', () => {
      expect(service.sum(1, 5, 3)).toBe(9);
    });

    it('should allow integer values', () => {
      expect(service.onlyInteger(10)).toBe(10);
    });

    it('should allow values within min/max range', () => {
      expect(service.ranged(5)).toBe(5);
      expect(service.ranged(10)).toBe(10);
    });
  });

  describe('min decorator', () => {
    it('should throw if value is less than min', () => {
      expect(() => service.sum(-1, 5, 3)).toThrow(InvalidArgumentError);
    });

    it('should throw with correct error message', () => {
      try {
        service.sum(-1, 5, 3);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidArgumentError);
        expect((e as Error).message).toContain('equal or greater than 0');
      }
    });
  });

  describe('max decorator', () => {
    it('should throw if value is greater than max', () => {
      expect(() => service.sum(1, 20, 3)).toThrow(InvalidArgumentError);
    });

    it('should throw with correct error message', () => {
      try {
        service.sum(1, 20, 3);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidArgumentError);
        expect((e as Error).message).toContain('equal or less than 10');
      }
    });

    describe('decorator override behavior', () => {
      class OverrideService {
        @validateNumbers
        test(@max(10) @max(5) value: number): number {
          return value;
        }
      }

      const service = new OverrideService();

      it('should override max value when decorator is applied multiple times', () => {
        // valor final é 10 (último decorator executado)
        expect(service.test(10)).toBe(10);
        expect(() => service.test(11)).toThrow(InvalidArgumentError);
      });
    });
  });

  describe('integer decorator', () => {
    it('should throw if value is not an integer', () => {
      expect(() => service.onlyInteger(1.5)).toThrow(InvalidArgumentError);
    });

    it('should accept safe integers', () => {
      expect(service.onlyInteger(Number.MAX_SAFE_INTEGER)).toBe(
        Number.MAX_SAFE_INTEGER
      );
    });

    it('should throw if value is NaN', () => {
      expect(() => service.onlyInteger(NaN)).toThrow(InvalidArgumentError);
    });
  });

  describe('combined decorators', () => {
    it('should validate min and max together', () => {
      expect(() => service.ranged(4)).toThrow(InvalidArgumentError);
      expect(() => service.ranged(11)).toThrow(InvalidArgumentError);
    });

    it('should pass when all constraints are satisfied', () => {
      expect(service.ranged(7)).toBe(7);
    });
  });

  describe('type validation', () => {
    it('should throw if value is not a number for min', () => {
      expect(() => service.sum('1' as any, 5, 3)).toThrow(InvalidArgumentError);
    });

    it('should throw if value is not a number for max', () => {
      expect(() => service.sum(1, '5' as any, 3)).toThrow(InvalidArgumentError);
    });
  });

  describe('no parameter metadata', () => {
    class NoMetadataService {
      @validateNumbers
      noValidation(a: number, b: number): number {
        return a + b;
      }
    }

    const service = new NoMetadataService();

    it('should not throw when there are no parameter decorators', () => {
      expect(service.noValidation(1, 2)).toBe(3);
    });
  });
});
