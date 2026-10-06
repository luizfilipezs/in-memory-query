# AGENTS.md — Global Rules and Conventions for `in-memory-query`

This file defines the global rules, architectural constraints, and non-negotiable coding conventions for development within the **`in-memory-query`** project. All AI agents and human developers MUST strictly follow these guidelines.

---

## 1. Project Overview

`in-memory-query` is an extremely lightweight, strongly typed in-memory data query engine in TypeScript, inspired by database query APIs.

- **Package Manager**: `pnpm` (`pnpm@12.6.0`).
- **Language**: TypeScript (target `es2022`, module `ESNext`/`Bundler`).
- **Build**: `tsdown` (dual output: ESM in `dist/esm` with `.d.ts` and CJS in `dist/cjs`).
- **Testing**: `vitest` (co-located `*.spec.ts` files).
- **Linter & Formatter**: ESLint v10 (Flat Config) + Prettier + Husky + `lint-staged`.

---

## 2. Directory Structure and Module Boundaries

```
in-memory-query/
├── .agents/
│   └── rules/             # Workflow-specific rules (tests, style, architecture)
├── dist/                  # Compiled build artifacts (ESM and CJS)
├── src/
│   ├── index.ts           # Public entry point (re-exports Query only)
│   ├── query.ts           # Main Query<T> class (fluent API)
│   ├── core/              # Core domain abstractions
│   │   ├── errors/        # Custom error classes (e.g., InvalidArgumentError)
│   │   ├── types/         # Internal query domain types
│   │   └── validation/    # Row validators and parameter decorators
│   ├── utils/             # Helper functions and TypeScript type helpers
│   │   ├── functions/     # Pure utility functions (generic/, sort/, type-guards/)
│   │   └── types/         # Reusable TypeScript utility types
│   └── __tests__/         # Main integration and unit tests
└── AGENTS.md              # Global rules (this file)
```

---

## 3. Non-Negotiable Coding Conventions

### 3.1. Strict TypeScript & Typing
1. **Mandatory Explicit Return Types**: Every function, method, and type guard MUST have an explicitly declared return type. (ESLint rule: `@typescript-eslint/explicit-function-return-type: error`).
2. **Type Imports**: Always use `import type { ... }` for importing types and interfaces (`verbatimModuleSyntax: true`).
3. **Active Strict Flags**: Honor `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true`. Explicitly handle potentially `undefined` values when accessing indexed elements.
4. **Private Class Fields**: Use ECMAScript native `#field` syntax exclusively for private members (e.g., `#rows`, `#startAt`, `#limit`). Never use TS `private` modifier to hide runtime properties.

### 3.2. Naming and Files
1. **File Names in `kebab-case`**: All files in `src/` MUST use `kebab-case` naming (e.g., `invalid-argument-error.ts`, `query-row-validator.ts`, `deep-equal.ts`).
2. **One Concept Per File**: Keep types, errors, and utility functions isolated in their own dedicated files under `src/core/types/`, `src/utils/types/`, etc.
3. **Exports**: Use **Named Exports exclusively** (`export class ...`, `export function ...`, `export type ...`). **Default exports (`export default`) are FORBIDDEN**.
4. **Classes and Types**: `PascalCase` (e.g., `Query`, `QueryRowValidator`, `InvalidArgumentError`, `WhereCondition`).
5. **Functions and Variables**: `camelCase` (e.g., `deepEqual`, `sortByProperty`, `isObject`, `validateNumbers`).

### 3.3. Documentation and Comments
1. **JSDoc on Public APIs**: Every public class, public method, and exported utility MUST contain JSDoc documentation including `@param`, `@returns`, `@typeParam`, and `@example` where applicable.
2. **Comment Preservation**: Do not remove or alter existing comments or docstrings without clear justification.

---

## 4. Architectural Constraints

1. **Lean Entry Point**: `src/index.ts` exposes only the intended public symbols for library consumers (`export { Query } from './query'`).
2. **Entry Factory**: Initialization of the `Query` class MUST be performed via static factory method `Query.from(rows)`. The constructor is private.
3. **Immutability vs. Fluent Chaining**:
   - Structural transformation methods (such as `select`, `map`) return new `Query` instances.
   - Filtering and stateful methods (`where`, `orderBy`, `skip`, `limit`) modify the internal state of the current instance and return `this`.
4. **Error Handling**:
   - Argument validation errors MUST throw instances of error classes located in `src/core/errors/` (e.g., `InvalidArgumentError`).
   - Never swallow exceptions with empty `try/catch` blocks or return silent fallbacks for invalid arguments.

---

## 5. Verification Workflow

Before considering any code change or task complete, the following commands MUST be run in the terminal and pass with absolute success:

1. **Unit Tests**:
   ```bash
   pnpm test --run
   ```
2. **Type Check**:
   ```bash
   pnpm type-check
   ```
3. **Linting & Formatting**:
   ```bash
   pnpm lint
   ```
