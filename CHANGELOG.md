# Changelog

## v2.4.1

### Summary

- [ ] Bug fixes
- [x] Code refactoring
- [ ] New features
- [x] Compatibility fixes
- [ ] Breaking changes

### Code refactoring

- Removed redundant conditions and unecessary code.
- Optimized array iteration performance:
  - Pre-allocate arrays to avoid dynamic resizing.
  - Replace `Array.map()` and `for...of` with indexed `for` loops.
- Updated JSDoc for `Query`.

### Compatibility fixes

- Updated development dependencies.

## v2.4.0

### Changes

- [ ] Bug fixes
- [ ] Code refactoring
- [x] New features
- [x] Build improvements
- [ ] Breaking changes

### New Features

- Added `min()`, `max()`, `sum()`, and `average()` methods to `Query`.

### Build Improvements
- Improved build output by introducing separate ESM and CJS bundles.
- ESM files are now emitted to `dist/esm` and CJS files to `dist/cjs`.
- Updated package exports to provide better compatibility with modern bundlers and Node.js.
- Reduced bundle size through improved minification and build configuration.
- Refactored build pipeline using multiple `tsup` configurations.
- Ensured type declarations are emitted only once to avoid duplication.

## v2.3.1

- Optimized build process with [tsup](https://tsup.egoist.dev/), tree-shaking and minification.
- Removed `utility-types` from dependencies list.

## v2.3.0

### Features

- Added optional `mapFn` to `groupBy()` method to transform grouped values.

## v2.2.0

### Features

- Added an overload to `groupBy()` supporting both property keys and custom grouping functions.

### Improvements

- Internal code refactoring with no functional changes.
- Updated the build process to ignore test files.
- Updated `.npmignore` file contents.

## v2.1.1

- Rebuild v2.1.0, for `lib` was outdated.

## v2.1.0

- Added method `map()` to `Query`, intended for data projection, but more flexible and better suited for complex transformations.

## v2.0.2

This release includes minor internal refactoring. There are no new features or breaking changes.

## Improvementskv

- Performed micro-optimizations on array operations.

## v2.0.1

This release includes minor internal refactoring. There are no new features or breaking changes.

## Improvements

- Avoid repeated instantiation of `QueryRowValidator` during row validation by leveraging static members.
- Replace `Array.prototype.every()` with a `for...of` loop for improved performance.

## v2.0.0

### Changes

* Updated the `select()` method to return a new `Query` instance containing only the selected columns.
* Added a new `groupBy()` method, which returns a `Map` with results grouped by the specified column.
* Added an optional `column` parameter to the `column()` method, allowing you to specify which column's values should be returned.
* Updated the `orderBy()` method to sort query results immediately, restoring the behavior from previous versions.

### Other Improvements

* Replaced Jest with Vitest, improving test performance.
* Added test coverage reporting.
* Expanded the test suite to cover more execution paths.

## v1.0.2

Impacts:

### Production

- Code refactory: replaced legacy code with modern alternatives without modifying behavior.
- Removed `reflect-metadata` from dependencies list.

### Development

- Replaced `tslint` by `eslint`.
- Updated `tsconfig.json` with stricter options.

## v1.0.1

### Ensure rows immutability in `orderBy()`

`orderBy()` behavior was updated to register the ordering option and apply it only to the results instead of sorting the actual rows immediately.

Before:

```ts
const results = Query.from(users)
  .orderBy('-name') // rows would be sorted immediately
  // ...
```

One problem with the former approach is that it was not possible to override the sorting by calling `orderBy` a second time; instead, the rows would only be sorted again.

Now:

```ts
const results = Query.from(users)
  .orderBy('-name')
  .orderBy('name') // the overriden orderBy option is the only one applied,
                   // affecting only the final results
  // ...
```

The new approach ensures that the inner rows always remain the same, maintaining their original order.

It is also possible to clear the ordering now:

```ts
const results = Query.from(users)
  .orderBy('name')
  .orderBy() // no sorting logic will be applied to the rows
```

### Fix Jest configuration

Update match to include `__tests__/*.spec.ts` files only. The previous configuration enabled testing JS and TS type files too, causing errors.

### Other improvements

- Create a `.prettierignore` file.
- Update `.npmignore` file contents.

## v1.0.0

Updates:

- Dependencies updated.
- Code refactored keeping previous behavior.
- Unit tests created or reviewed to cover the whole codebase.
- Migrated from npm to pnpm.
- Prettier configuration updated and integrated with Visual Studio Code.

## v0.0.0

Create initial project.
