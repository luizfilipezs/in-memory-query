# Query Engine Architectural Rules (`.agents/rules/architecture.md`)

This rule documents the architectural principles, design patterns, and development lifecycle guidelines for the **`in-memory-query`** repository.

---

## 1. General Architectural Principles

1. **Zero Runtime Dependencies**:
   - `in-memory-query` is a lightweight library designed to run in both Node.js and browser environments with zero runtime dependencies (empty `dependencies` in `package.json`).
   - Do not add runtime dependencies without prior approval.

2. **Fluency and Immutability in the `Query` API**:
   - The `Query<T>` class exposes a chainable fluent builder API.
   - **Factory Entry Point**: Initialization is done via `Query.from(rows)`, creating a shallow copy of the input data array (`Array.from(rows)`).
   - **Structural Transformations (Immutable)**: Operations such as `.select()`, `.map()` generate and return **new `Query` instances**, leaving the original query instance untouched.
   - **Filters and Paging (Internal Mutation)**: State and filter operations such as `.where()`, `.orderBy()`, `.skip()`, `.limit()` mutate internal private fields (`#rows`, `#startAt`, `#limit`) on the current instance and return `this`.

---

## 2. Domain Error Handling

1. **Custom Error Classes**:
   - MUST extend the native `Error` class and be defined in `src/core/errors/`.
   - MUST set `this.name` in the constructor to match the error class name.
   ```ts
   export class InvalidArgumentError extends Error {
     constructor(message: string) {
       super(message);
       this.name = 'InvalidArgumentError';
     }
   }
   ```
2. **Input Validation**:
   - Numeric pagination parameters (`skip`, `limit`) use decorators in `src/core/validation/decorators/number-validaton.ts` or explicit assertions to ensure non-negative integers, throwing `InvalidArgumentError` otherwise.

---

## 3. Layer Structuring and Organization

```
src/
├── core/            # Fundamental engine rules and contracts
│   ├── errors/      # Validation and operational error classes
│   ├── types/       # Internal domain types
│   └── validation/  # Row validators (QueryRowValidator) and decorators
└── utils/           # Collection of isolated side-effect-free utilities
    ├── functions/   # Pure functions (generic/, sort/, type-guards/)
    └── types/       # Advanced TypeScript type utilities
```

---

## 4. Release Process & Change Documentation (`CHANGELOG.md`)

When making changes or releasing a new version:
1. Follow semantic versioning (`pnpm version patch`, `pnpm version minor`, or `pnpm version major`).
2. Update `CHANGELOG.md` following the template documented in `README-DEV.md`:

```md
## Upcoming update

### Summary

- [ ] Bug fixes
- [x] Code refactoring
- [ ] New features
- [x] Compatibility fixes
- [ ] Breaking changes

### Code refactoring

- Clear description of the refactoring performed.

### Compatibility fixes

- Description of compatibility fixes.
```
