<h1 align="center">
in-memory-query
</h1>
<p align="center">
A lightweight, type-safe in-memory query engine for JavaScript and TypeScript.
<p>
<p align="center">
  <a href="https://www.npmjs.com/package/in-memory-query"><img src="https://img.shields.io/npm/v/in-memory-query.svg" alt="current in-memory-query version badge"></a>
  <a href="https://codecov.io/gh/luizfilipezs/in-memory-query"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/luizfilipezs/in-memory-query.svg?style=flat-square"></a>
<p>

## `Query`

Usage:

```ts
const usersQuery = Query.from(users);
```

TypeScript will automatically infer the query data type. You can also make it explicit:

```ts
const usersQuery = Query.from<User>(users);
```

---

### Filtering data

#### `where(condition)`

This method accepts two types of parameters:

1. An object, where each property represents a field to be validated.
2. A callback function that returns a boolean.

When passing an object, each property can be either a literal value or a callback function used for validation.

```ts
const activeGmailUsers = Query.from(users)
  .where({
    isActive: true,
    email: (email) => email.endsWith('@gmail.com'),
  })
  .where((user) => !user.isAdmin())
  .all();
```

It also supports nested objects:

```ts
.where({
  permissions: {
    sendNotifications: true,
  },
})
```

---

#### `filterWhere(condition)`

Unlike `where()`, `filterWhere()`:

* Accepts only an object
* Ignores properties whose values are `null` or `undefined`

```ts
let isActive: boolean; // undefined

const filteredUsers = Query.from(users)
  .filterWhere({
    id: 1,
    isActive: isActive, // ignored
  })
  .all();
```

> **Note:** If you need to explicitly check for `null` or `undefined`, use `where()` instead.

---

#### `distinct(key | callback)`

Removes duplicate rows based on a key or a callback function.

- `key`: The key to be used for comparison.
- `callback`: A function that maps each row to a value.

```ts
const uniqueCountries = Query.from(addresses)
  .distinct('country')
  .column('country');

const uniqueEmailProviders = Query.from(users)
  .distinct((user) => user.email.split('@')[1])
  .column('email');
```

### Selecting data

#### `select(columns)`

Defines which columns should be selected, returning a new query with rows containing only the selected columns.

Accepts multiple column names.

```ts
.select('id', 'email')
```

---

#### `map(callback)`

Transforms each row into a new object using a callback function.

Like `select()`, this method is intended for data projection, but it is more flexible and better suited for complex transformations:

Callback arguments:

- `row`: The current row.
- `index`: The index of the current row.


```ts
const authorsWithFirstPostQuery = Query.from(authors)
  .map(({ posts, ...author }) => ({
    ...author
    firstPost: posts[0],
  }));
```

When dealing with simple scenarios, prefer `select()`:

```ts
// ⚠️ More verbose than necessary
const query = Query.from(users)
  .map((user) => ({
    id: user.id,
    email: user.email,
  }));

// ✅ More concise and expressive
const query = Query.from()
  .select('id', 'email');
```

---

### Ordering results

#### `orderBy(...columns | (callback, order?))`

Sorts the results.

- `columns`: the columns to order by.
- `callback`: A function that maps each row to a value.
- `order`: The order to sort in.

You can specify column names or a callback function to map each row to a value.

Examples:

```ts
// Column names with ASC and DESC (-) order
.orderBy('name', '-createdAt')

// callback with ASC order by default
.orderBy((user) => user.address.country)

// callback with ASC order set explicitly
.orderBy((user) => user.address.country, 'asc')

// callback with DESC order
.orderBy((user) => user.address.country, 'desc')
```

---

### Paginating results

#### `skip(numberOfRows)`

Skips the first results.

```ts
.skip(5)
```

Example:

```ts
const secondId = Query.from(users)
  .select('id')
  .skip(1)
  .scalar();
```

> Passing a non-integer or a negative number will throw an `InvalidArgumentError`.

---

#### `limit(limit)`

Limits the number of results returned.

```ts
.limit(100)
```

> Passing a non-integer or a negative number will throw an `InvalidArgumentError`.

---

#### `limitPerGroup(key | fn, limit)`

Limits the number of rows per group.

- `key`: The property name to group by.
- `fn`: A function that maps each row to a grouping value.
- `limit`: The maximum number of rows to keep per group.

> ⚠️ The rows kept depend on the current ordering of the query.
> Use `orderBy()` beforehand to control which rows are selected.

Examples:

```ts
// with key
const countries = Query.from(addresses)
  .orderBy('-createdAt')
  .limitPerGroup('country', 2)
  .column('country'); // ['Argentina', 'Argentina', 'Brazil', 'Brazil', 'Chile', 'Chile']

// with callback
const countries = Query.from(addresses)
  .orderBy('-createdAt')
  .limitPerGroup((row) => row.country, 2)
  .column('country');
```

> Passing a non-integer or a negative number to `limit` will throw an `InvalidArgumentError`.

---

#### `top(limit, options?)`

Keeps the top N rows, optionally partitioned by a key or callback.

- `limit`: The maximum number of rows to keep.
- `options.partitionBy`: A property name or function to define groups.
- `options.orderBy`: A column or list of columns to define ordering.

If `partitionBy` is provided, the limit is applied per group.

The rows kept depend on the ordering. Use `orderBy` (either here or before)
to control which rows are selected.

Examples:

```ts
// top N globally
const ids = Query.from(addresses)
  .orderBy('-createdAt')
  .top(3)
  .column('id'); // [6, 5, 4]

// top N per group (key)
const countries = Query.from(addresses)
  .top(2, {
    partitionBy: 'country',
    orderBy: '-createdAt',
  })
  .column('country'); // ['Argentina', 'Argentina', 'Brazil', 'Brazil', 'Chile', 'Chile']

// top N per group (callback)
const countries = Query.from(addresses)
  .top(1, {
    partitionBy: (row) => row.country,
    orderBy: '-createdAt',
  })
  .column('country'); // ['Argentina', 'Brazil', 'Chile']

// without orderBy (keeps original order)
const countries = Query.from(addresses)
  .top(1, { partitionBy: 'country' })
  .column('country'); // ['Brazil', 'Chile', 'Argentina']
```

> Passing a non-integer or a negative number to `limit` will throw an `InvalidArgumentError`.

---

### Getting results

#### `all()`

Returns all results.

---

#### `first()`

Returns the first result.

---

#### `last()`

Returns the last result.

---

#### `count()`

Returns the number of results.

---

#### `exists()`

Returns a boolean indicating whether any results exist.

---

#### `scalar()`

Returns the value of the first property of the first result.

```ts
const firstId = Query.from(users).scalar();
```

You can combine it with `select()` to retrieve a specific property:

```ts
const firstEmail = Query.from(users)
  .select('email')
  .scalar();
```

Returns `false` if no value is found.

---

#### `column()`

Returns the values of the first property from all results by default.

```ts
const ids = Query.from(users).column();
```

You can specify a column:

```ts
const emails = Query.from(users).column('email');
```

Or combine it with `select()`:

```ts
const emails = Query.from(users)
  .select('email')
  .column();
```

---

#### `values()`

Returns all results as arrays of values.

```ts
const data = Query.from(users)
  .select(['id', 'email'])
  .values();
```

Example output:

```ts
[
  [1, 'john@icloud.com'],
  [2, 'mary@gmail.com']
]
```

---

#### `groupBy(key | callback, mapFn?)`

Groups the items by a specified property or a custom callback and returns the result as a `Map`.

- `key`: The property name to group by.
- `callback`: A function that returns the value to group each item by.
- `mapFn` *(optional)*: A function to transform each item before adding it to the grouped result.

The returned `Map` uses the resolved grouping values as keys and arrays of matching (or mapped) items as values.

```ts
// Grouping by property
const usersByActiveStatus = Query.from(users).groupBy('isActive');
// Map<boolean, User[]>

// Grouping by property with mapping
const idsByActiveStatus = Query.from(users).groupBy(
  'isActive',
  (user) => user.id
);
// Map<boolean, number[]>

// Grouping by callback
const usersByActiveStatus = Query.from(users).groupBy(
  (user) => user.isActive
);
// Map<boolean, User[]>

// Grouping by callback with mapping
const idsByNotificationPreference = Query.from(users).groupBy(
  (user) => user.permissions.sendNotifications,
  (user) => user.id
);
// Map<boolean, number[]>
```

### Aggregating data

#### `min(key | callback)`

Returns the minimum numeric value from the results.

- `key`: The numeric column to evaluate.
- `callback`: A function that maps each row to a number.

Returns `null` if no rows exist.

```ts
// Using a column
const minAge = Query.from(users).min('age');

// Using a callback
const minNameLength = Query.from(users).min(
  (user) => user.name.length
);
```

#### `max(key | callback)`

Returns the maximum numeric value from the results.

- `key`: The numeric column to evaluate.
- `callback`: A function that maps each row to a number.

Returns `null` if no rows exist.

```ts
// Using a column
const maxAge = Query.from(users).max('age');

// Using a callback
const maxNameLength = Query.from(users).max(
  (user) => user.name.length
);
```

#### `sum(key | callback)`

Returns the sum of numeric values from the results.

- `key`: The numeric column to evaluate.
- `callback`: A function that maps each row to a number.

Returns `0` if no rows exist.

```ts
// Using a column
const totalAge = Query.from(users).sum('age');

// Using a callback
const totalNameLength = Query.from(users).sum(
  (user) => user.name.length
);
```

#### `average(key | callback)`

Returns the average of numeric values from the results.

- `key`: The numeric column to evaluate.
- `callback`: A function that maps each row to a number.

Returns `null` if no rows exist.

```ts
// Using a column
const averageAge = Query.from(users).average('age');

// Using a callback
const averageNameLength = Query.from(users).average(
  (user) => user.name.length
);
```
