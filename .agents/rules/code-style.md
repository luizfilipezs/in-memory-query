# Code Style and Typing Rules (`.agents/rules/code-style.md`)

This rule establishes formatting guidelines, naming standardization, and TypeScript type safety policies for the **`in-memory-query`** repository.

---

## 1. TypeScript Typing Rules

1. **Explicit Return Types**:
   - All functions, class methods, decorators, and type guards MUST explicitly declare their return type.
   ```ts
   // CORRECT
   export function isNumber(value: unknown): value is number {
     return typeof value === 'number' && !Number.isNaN(value);
   }

   // INCORRECT (Missing explicit return type)
   export function isNumber(value: unknown) {
     return typeof value === 'number' && !Number.isNaN(value);
   }
   ```

2. **Type Imports (`verbatimModuleSyntax`)**:
   - Imports referencing only TypeScript types or interfaces MUST use the `type` keyword prefix.
   ```ts
   // CORRECT
   import type { WhereCondition } from './core/types/where-condition';
   import { QueryRowValidator } from './core/validation/query-row-validator';

   // INCORRECT
   import { WhereCondition } from './core/types/where-condition';
   ```

3. **ES Native Private Members (`#private`)**:
   - For private encapsulation in classes, always use ECMAScript `#privateField` syntax. Do not use the TypeScript `private` modifier unless for constructor parameter properties.
   ```ts
   // CORRECT
   export class Query<T extends object> {
     #rows: T[] = [];
     #limit: number | null = null;
   }
   ```

4. **Unused Variables**:
   - If an unused parameter or variable must be declared, prefix it with `_` (e.g., `_index`).

---

## 2. Naming Conventions

| Element | Convention | Example |
| :--- | :--- | :--- |
| **TypeScript Files** | `kebab-case.ts` | `query-row-validator.ts`, `deep-equal.ts` |
| **Test Files** | `kebab-case.spec.ts` | `query-row-validator.spec.ts` |
| **Classes & Interfaces** | `PascalCase` | `QueryRowValidator`, `InvalidArgumentError` |
| **Types (`type`)** | `PascalCase` | `WhereCondition`, `SortOrder` |
| **Functions & Methods** | `camelCase` | `deepEqual`, `sortByProperty` |
| **Variables & Parameters** | `camelCase` | `propName`, `sortOrder` |

---

## 3. Exports and File Organization

1. **Exclusive Named Exports**:
   - Always use named exports: `export class ...`, `export function ...`, `export const ...`.
   - **Default exports (`export default`) are FORBIDDEN**.
2. **Re-exports**:
   - `src/index.ts` is the sole re-export point for the public library API.

---

## 4. Formatting and Linting

- **Prettier**:
  - Single quotes (`singleQuote: true`).
  - ES5 trailing commas (`trailingComma: "es5"`).
  - Automatic import sorting via `prettier-plugin-organize-imports`.
- **ESLint**:
  - Run `pnpm lint` to automatically fix formatting and lint issues.
  - Do not disable rules using `// eslint-disable-next-line` without documented architectural rationale.
