# Testing Rules (`.agents/rules/testing.md`)

This rule specifies mandatory conventions and standards for creating, organizing, and executing automated tests in the **`in-memory-query`** repository.

---

## 1. Framework and Execution

- **Framework**: Use **Vitest** exclusively.
- **Execution Command**: `pnpm test --run` (for single-run full test suite execution without watch mode).
- **Coverage Command**: `pnpm test:cov`.

---

## 2. File Location and Nomenclatures

1. **File Suffix**: All test files MUST use the `.spec.ts` extension.
2. **Co-located Unit Tests**:
   - Tests for utility functions and core components MUST be placed inside a `__tests__/` subdirectory adjacent to the target source file.
   - **Example**: Tests for `src/utils/functions/generic/deep-equal.ts` MUST reside in `src/utils/functions/generic/__tests__/deep-equal.spec.ts`.
   - **Example**: Tests for `src/core/errors/invalid-argument-error.ts` MUST reside in `src/core/errors/__tests__/invalid-argument-error.spec.ts`.
3. **Main Engine Tests (`Query`)**:
   - Integration and unit tests for the main `Query` class reside in `src/__tests__/query.spec.ts`.

---

## 3. Test Structure

1. **Grouping with `describe`**:
   - Organize tests using logically nested `describe` blocks.
   - The top-level `describe` should state the target function, method, or class under test.
   - Sub-`describe` blocks should group specific scenarios (e.g., `primitive values`, `objects`, `nested structures`, `edge cases`).

```ts
import { deepEqual } from '../deep-equal';

describe('deepEqual', () => {
  describe('primitive values', () => {
    it('returns true for strictly equal primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
    });
  });
});
```

2. **Test Descriptions (`it` / `test`)**:
   - Use `it('describes expected behavior...', () => { ... })`.
   - Descriptions MUST be clear and written in English using present tense verbs (e.g., `returns true for...`, `throws InvalidArgumentError when...`, `filters rows correctly...`).

---

## 4. Coverage and Mandatory Scenarios

Every created or modified feature MUST include test cases for:
1. **Happy Path**: Expected functionality given valid inputs.
2. **Edge Cases**:
   - Empty arrays.
   - Null and undefined values (`null`, `undefined`).
   - Missing properties or mixed data types.
3. **Errors and Exceptions**:
   - Test explicit exception throwing when invalid arguments are provided.
   - Use Vitest error assertions: `expect(() => Query.from([]).skip(-1)).toThrow(InvalidArgumentError);`.

---

## 5. Acceptance Criteria for Tests

No code change or feature will be accepted without:
1. New/updated unit tests covering the changes.
2. Clean execution of `pnpm test --run` with 100% of tests passing.
