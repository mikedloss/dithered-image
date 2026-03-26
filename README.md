# dithered-image

Monorepo for interactive dithered/stippled effects for the web.

## Packages

| Package | Description |
| --- | --- |
| [`packages/dithered-image`](packages/dithered-image) | Dither images with Canvas 2D ([npm](https://www.npmjs.com/package/@dloss/dithered-image)) |
| [`packages/dithered-element`](packages/dithered-element) | Dither any React component ([npm](https://www.npmjs.com/package/@dloss/dithered-element)) |
| [`apps/docs`](apps/docs) | Documentation and demo site |

## Development

Requires [Bun](https://bun.sh) and uses [Turborepo](https://turbo.build) for task orchestration.

```bash
# Install dependencies
bun install

# Start the docs dev server (with HMR)
bun dev

# Build everything (library first, then docs)
bun run build

# Build the library only
bun run build:lib

# Lint
bun run lint

# Remove all node_modules, dist folders, and turbo cache
bun run clean
```

## License

MIT
