# Development instructions

## Installing dependencies

```bash
pnpm install
```

## Useful scripts

### Checking build final size

```bash
pnpm pack && mkdir -p tmp && tar -xzf *.tgz -C tmp && find tmp -type f -exec wc -c {} + | tail -n1 | awk '{print $1/1000 " kB"}' && rm -rf tmp && rm *.tgz
```

### Publishing a new version

#### Patch (`0.0.x`)

To publish bug fixes or improvements:


```bash
pnpm version patch
```

#### Minor (`0.x.0`)

To publish new features:

```bash
pnpm version minor
```

#### Major (`x.0.0`)

To publish breaking changes:


```bash
pnpm version major
```

## Documenting changes

When working on or publishing a new version, please update the `CHANGELOG.md` file like this:

```md
## Upcoming update

### Summary

- [ ] Bug fixes
- [x] Code refactoring
- [ ] New features
- [x] Compatibility fixes
- [ ] Breaking changes

### Code refactoring

- Removed redundant conditions and unecessary code.
- Updated JSDoc for `Query`.

### Compatibility fixes

- Updated development dependencies.
```

> Replace "Upcoming update" with the new version name before publishing.
