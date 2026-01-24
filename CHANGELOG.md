# Changelog

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
