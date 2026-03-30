<h1 align="center">
querier-ts
</h1>
<p align="center">
A lightweight, type-safe in-memory query engine for JavaScript and TypeScript.
<p>
<p align="center">
  <a href="https://npmx.dev/package/querier-ts"><img src="https://img.shields.io/npm/v/querier-ts?color=729B1B&label=" alt="current querier-ts version badge"></a>
<p>

## `Query`

You can create a `Query` instance like this:

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

#### `orderBy(...columns)`

Sorts the results. You can pass multiple columns.

```ts
.orderBy('name', 'id')
```

In this example, `name` has higher priority than `id`.

You can also sort in descending order by prefixing the column with `-`:

```ts
const lastId = Query.from(users)
  .select('id')
  .orderBy('-id')
  .scalar();
```

---

### Limiting results

#### `limit(limit)`

Limits the number of results returned.

```ts
.limit(100)
```

> Passing a non-integer or a negative number will throw an `InvalidArgumentError`.

---

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
