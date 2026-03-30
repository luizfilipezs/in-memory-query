# Development instructions

## Installing dependencies

```bash
pnpm install
```

## Useful scripts

### Checking build final size

```bash
pnpm pack && ls -lh *.tgz && rm *.tgz
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
