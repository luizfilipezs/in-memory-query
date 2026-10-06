<h1 align="center">
  In-Memory Query
</h1>

<p align="center">
  A lightweight, zero-dependency, type-safe in-memory query engine with powerful TypeScript inference.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/in-memory-query"><img src="https://img.shields.io/npm/v/in-memory-query.svg" alt="npm version"></a>
  <a href="https://codecov.io/gh/luizfilipezs/in-memory-query"><img alt="Coverage Status" src="https://img.shields.io/codecov/c/github/luizfilipezs/in-memory-query.svg?style=flat-square"></a>
  <a href="https://github.com/luizfilipezs/in-memory-query/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/in-memory-query.svg" alt="license"></a>
</p>

---

`in-memory-query` brings database-like querying capabilities (filtering, projection, ordering, pagination, grouping, and aggregations) directly to JavaScript and TypeScript arrays or iterables, with full type safety and auto-completion.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Example](#quick-example)
- [Core Concepts & Design](#core-concepts--design)
- [API Reference](#api-reference)
  - [Creating a Query](#creating-a-query)
  - [Filtering Data](#filtering-data)
    - [`where(condition)`](#wherecondition)
    - [`filterWhere(condition)`](#filterwherecondition)
    - [`distinct(key | callback)`](#distinctkey--callback)
  - [Selecting & Projecting](#selecting--projecting)
    - [`select(...columns)`](#selectcolumns)
    - [`omit(...columns)`](#omitcolumns)
    - [`map(callback)`](#mapcallback)
  - [Ordering & Sorting](#ordering--sorting)
    - [`orderBy(...)`](#orderby)
  - [Pagination & Windowing](#pagination--windowing)
    - [`skip(numberOfRows)`](#skipnumberofrows)
    - [`limit(limit)`](#limitlimit)
    - [`limitPerGroup(key | callback, limit)`](#limitpergroupkey--callback-limit)
    - [`top(limit, options?)`](#toplimit-options)
    - [`chunk(size)`](#chunksize)
  - [Executing & Retrieving Results](#executing--retrieving-results)
    - [`all()`](#all)
    - [`first()`](#first)
    - [`last()`](#last)
    - [`count()`](#count)
    - [`exists()`](#exists)
    - [`scalar()`](#scalar)
    - [`column(column | callback?)`](#columncolumn--callback)
    - [`values()`](#values)
    - [`groupBy(...)`](#groupby)
  - [Aggregations](#aggregations)
    - [`min(key | callback)`](#minkey--callback)
    - [`max(key | callback)`](#maxkey--callback)
    - [`sum(key | callback)`](#sumkey--callback)
    - [`average(key | callback)`](#averagekey--callback)
- [License](#license)

---

## Features

- ⚡ **Zero Runtime Dependencies**: Ultra-lightweight footprint.
- 🛡️ **End-to-End TypeScript Safety**: Automatic autocomplete for object properties, nested paths, and strict return types.
- 🔄 **Fluent Builder API**: Chainable methods for clean and readable code pipelines.
- 🔍 **Flexible Conditions**: Supports literal matching, nested object conditions, custom predicate functions, and dynamic query filters ignoring `null`/`undefined`.
- 📊 **Powerful Grouping & Aggregations**: Group data by property or function, transform group items, aggregate values, or partition pagination (`top`, `limitPerGroup`).

---

## Installation

```bash
# npm
npm install in-memory-query

# pnpm
pnpm add in-memory-query

# yarn
yarn add in-memory-query
```

---

## Quick Example

```ts
import { Query } from 'in-memory-query';

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  role: 'admin' | 'user';
}

const users: User[] = [
  { id: 1, name: 'John', email: 'john@example.com', isActive: true, role: 'admin' },
  { id: 2, name: 'Mary', email: 'mary@gmail.com', isActive: true, role: 'user' },
  { id: 3, name: 'Bob', email: 'bob@outlook.com', isActive: false, role: 'user' },
];

// Query active users with a custom email filter, ordered by name
const activeUsers = Query.from(users)
  .where({
    isActive: true,
    email: (email) => email.endsWith('@gmail.com') || email.endsWith('@example.com'),
  })
  .orderBy('name')
  .select('id', 'name', 'email')
  .all();

console.log(activeUsers);
// Output: [
//   { id: 1, name: 'John', email: 'john@example.com' },
//   { id: 2, name: 'Mary', email: 'mary@gmail.com' }
// ]
```

---

## Core Concepts & Design

- **Factory Creation**: Use `Query.from(iterable)` to create a query instance. Accepts arrays, `Set`, `Map.values()`, or any JavaScript iterable.
- **Immutability vs. Chainability**:
  - Projection operations (`select()`, `map()`) create and return a **new `Query` instance** with the projected structure.
  - Filtering and pagination methods (`where()`, `filterWhere()`, `orderBy()`, `skip()`, `limit()`) mutate internal query state and return `this` for fluent chaining.
- **Lazy Execution**: Pagination (`skip`, `limit`) and result transformation (`column`, `values`, `scalar`) are evaluated when you call an execution method (`all()`, `first()`, `groupBy()`, etc.).

---

## API Reference

### Creating a Query

#### `Query.from(source)`

Initializes a new `Query` instance from an array or iterable.

```ts
// From Array
const query1 = Query.from(users);

// From Set
const query2 = Query.from(new Set(users));

// From Map values
const query3 = Query.from(userMap.values());
```

---

### Filtering Data

#### `where(condition)`

Applies filtering criteria to the query. Accepts either:

1. **Condition Object**: Properties correspond to attributes of `T`. Values can be literal expected values, nested object conditions, or predicate callbacks `(value: T[K]) => boolean`.
2. **Predicate Function**: `(row: T) => boolean`.

Multiple `where()` calls can be chained and will be combined with logical `AND`.

```ts
// Object condition with literal and predicate function
const activeAdmins = Query.from(users)
  .where({
    isActive: true,
    role: 'admin',
    email: (email) => email.endsWith('@company.com'),
  })
  .all();

// Custom row predicate function
const customFilter = Query.from(users)
  .where((user) => user.name.startsWith('J') && user.id > 0)
  .all();

// Deep nested object condition
const brazilUsers = Query.from(users)
  .where({
    address: {
      country: 'Brazil',
    },
  })
  .all();
```

---

#### `filterWhere(condition)`

Similar to `where()`, but designed for dynamic search forms: **properties with `null` or `undefined` values are ignored**.

```ts
// Imagine these values come from user input form controls
const nameFilter = undefined; // User left name blank -> IGNORED
const roleFilter = 'admin';   // User selected 'admin' -> APPLIED

const searchResult = Query.from(users)
  .filterWhere({
    name: nameFilter,
    role: roleFilter,
  })
  .all();
```

> **Note:** If you want to explicitly search for rows where a property *is* `null` or `undefined`, use `where()` instead of `filterWhere()`.

---

#### `distinct(key | callback)`

Removes duplicate rows based on a property key or a custom selector function. Preserves current dataset ordering.

```ts
// Distinct by property key
const uniqueRoles = Query.from(users)
  .distinct('role')
  .all();

// Distinct by callback
const uniqueCountries = Query.from(users)
  .distinct((user) => user.address.country)
  .all();
```

---

### Selecting & Projecting

#### `select(...columns)`

Pick specific columns to include in the output, returning a **new `Query` instance** with objects containing only the selected keys.

```ts
const summary = Query.from(users)
  .select('id', 'name')
  .all();

// Output shape: { id: number; name: string }[]
```

---

#### `omit(...columns)`

Removes specific columns from the output objects, returning a **new `Query` instance** with objects containing all keys except the omitted ones.

```ts
const safeUsers = Query.from(users)
  .omit('permissions', 'address')
  .all();

// Output shape: Omit<User, 'permissions' | 'address'>[]
```

---

#### `map(callback)`

Transforms each row into a new object structure using a mapping function. Returns a **new `Query` instance**.

Callback arguments:
- `row`: The current item.
- `index`: The zero-based index of the current item.

```ts
const formatted = Query.from(users)
  .map((user, index) => ({
    key: `user-${user.id}`,
    label: `${index + 1}. ${user.name} (${user.role})`,
  }))
  .all();
```

> 💡 **Tip:** For simple key picking, prefer `select('id', 'name')` over `map()`. It is more concise and expressive.

---

### Ordering & Sorting

#### `orderBy(...)`

Sorts the dataset. Supports multiple column names or custom callback functions.

- **Column names**: Pass column names as strings. Prefix with `-` for descending order (`DESC`).
- **Callback function**: Pass `(row: T) => TReturn` and an optional sort order (`'asc'` | `'desc'`).

```ts
// Sort by name ASC, then createdAt DESC
Query.from(users).orderBy('name', '-createdAt');

// Sort by custom callback (default ASC)
Query.from(users).orderBy((user) => user.address.city);

// Sort by custom callback with explicit DESC
Query.from(users).orderBy((user) => user.name.length, 'desc');
```

---

### Pagination & Windowing

#### `skip(numberOfRows)`

Skips the specified number of leading rows.

```ts
const offsetUsers = Query.from(users)
  .orderBy('id')
  .skip(10)
  .all();
```

> ⚠️ Throws an `InvalidArgumentError` if `numberOfRows` is negative or not an integer.

---

#### `limit(limit)`

Limits the maximum number of rows returned.

```ts
const topTen = Query.from(users)
  .orderBy('-score')
  .limit(10)
  .all();
```

> ⚠️ Throws an `InvalidArgumentError` if `limit` is negative or not an integer.

---

#### `limitPerGroup(key | callback, limit)`

Limits the number of items kept per group (partition).

- `key | callback`: Property key or function defining the group.
- `limit`: Maximum number of items allowed per group.

```ts
// Keep at most 2 addresses per country (respecting current ordering)
const addressesPerCountry = Query.from(addresses)
  .orderBy('-createdAt')
  .limitPerGroup('country', 2)
  .all();

// Using a callback for group key
const limitedByDomain = Query.from(users)
  .limitPerGroup((user) => user.email.split('@')[1], 5)
  .all();
```

---

#### `top(limit, options?)`

Keeps the top `N` rows globally or per group partition, with inline ordering.

- `limit`: Maximum number of items to keep.
- `options.partitionBy` *(optional)*: Property key or callback to partition groups.
- `options.orderBy` *(optional)*: Column or array of columns to sort by before applying top limit.

```ts
// Top 3 globally by creation date
const newestAddresses = Query.from(addresses)
  .top(3, { orderBy: '-createdAt' })
  .all();

// Top 2 per country by creation date
const topPerCountry = Query.from(addresses)
  .top(2, {
    partitionBy: 'country',
    orderBy: '-createdAt',
  })
  .all();
```

---

#### `chunk(size)`

Splits the query results into an array of row batches (`T[][]`) of specified size.

```ts
const userBatches = Query.from(users)
  .where({ isActive: true })
  .chunk(10);
// Returns batches of up to 10 users per array
```

> ⚠️ Throws an `InvalidArgumentError` if `size` is not an integer or is less than 1.

---

### Executing & Retrieving Results

#### `all()`

Executes the query pipeline and returns all matching rows as an array `T[]`.

```ts
const results = Query.from(users).all();
```

---

#### `first()`

Returns the first matching row, or `null` if the query result is empty.

```ts
const firstUser = Query.from(users).where({ isActive: true }).first();
```

---

#### `last()`

Returns the last matching row, or `null` if the query result is empty.

```ts
const lastUser = Query.from(users).last();
```

---

#### `count()`

Returns the number of matching rows after filtering and pagination.

```ts
const totalActive = Query.from(users).where({ isActive: true }).count();
```

---

#### `exists()`

Returns `true` if at least one matching row exists, `false` otherwise.

```ts
const hasAdmins = Query.from(users).where({ role: 'admin' }).exists();
```

---

#### `scalar()`

Returns the value of the first property of the first row, or `false` if no rows exist.

```ts
// Retrieve a single property scalar value
const adminEmail = Query.from(users)
  .where({ role: 'admin' })
  .select('email')
  .scalar();
// Returns 'john@example.com' or false
```

---

#### `column(column | callback?)`

Extracts a flat array of values for a given column or mapping function across all matching rows. If called without arguments, extracts the first available property.

```ts
// Extract property array by column name
const emails = Query.from(users).column('email');
// ['john@example.com', 'mary@gmail.com', ...]

// Extract using a custom mapping callback
const formattedNames = Query.from(users).column((user) => user.name.toUpperCase());

// Default (extracts values of the first property in the shape)
const firstColValues = Query.from(users).column();
```

---

#### `values()`

Returns all matching rows as arrays of cell values (tuples).

```ts
const tableData = Query.from(users)
  .select('id', 'name', 'email')
  .values();

// Output:
// [
//   [1, 'John', 'john@example.com'],
//   [2, 'Mary', 'mary@gmail.com']
// ]
```

---

#### `groupBy(...)`

Groups query results by a property or callback function, returning a native JavaScript `Map`.

Supports flexible signature combinations:
- `groupBy(key | groupFn)` -> Returns `Map<Key, T[]>`
- `groupBy(key | groupFn, mapKey | mapFn)` -> Returns `Map<Key, MappedValue[]>`
- `groupBy(key | groupFn, mapKey | mapFn, aggregateFn)` -> Returns `Map<Key, AggregatedValue>`

Examples:

```ts
// 1. Simple grouping by property
const byStatus = Query.from(users).groupBy('isActive');
// Map<boolean, User[]>

// 2. Group by property and extract specific column
const idsByStatus = Query.from(users).groupBy('isActive', 'id');
// Map<boolean, number[]>

// 3. Group by property and aggregate group items
const countByStatus = Query.from(users).groupBy(
  'isActive',
  'id',
  (groupIds) => groupIds.length
);
// Map<boolean, number>

// 4. Group by custom callback function
const byEmailDomain = Query.from(users).groupBy(
  (user) => user.email.split('@')[1]
);
// Map<string, User[]>

// 5. Group by callback, map items, and aggregate
const maxIdByDomain = Query.from(users).groupBy(
  (user) => user.email.split('@')[1],
  (user) => user.id,
  (ids) => Math.max(...ids)
);
// Map<string, number>
```

---

### Aggregations

#### `min(key | callback)`

Calculates the minimum numeric value of a column or callback across matching rows. Returns `null` if the query is empty.

```ts
const minAge = Query.from(users).min('age');
const minNameLength = Query.from(users).min((user) => user.name.length);
```

---

#### `max(key | callback)`

Calculates the maximum numeric value of a column or callback across matching rows. Returns `null` if the query is empty.

```ts
const maxScore = Query.from(users).max('score');
const maxNameLength = Query.from(users).max((user) => user.name.length);
```

---

#### `sum(key | callback)`

Calculates the sum of numeric values of a column or callback across matching rows. Returns `0` if the query is empty.

```ts
const totalRevenue = Query.from(orders).sum('totalPrice');
const totalChars = Query.from(users).sum((user) => user.name.length);
```

---

#### `average(key | callback)`

Calculates the arithmetic mean (average) of numeric values of a column or callback across matching rows. Returns `null` if the query is empty.

```ts
const avgPrice = Query.from(products).average('price');
const avgNameLength = Query.from(users).average((user) => user.name.length);
```

---

## License

[MIT](LICENSE) © [Luiz Filipe da Silva](https://github.com/luizfilipezs)
