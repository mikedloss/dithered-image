# @dloss/dithered-image

Interactive dithered/stippled image effect for the web. Converts any raster image into a field of animated dots rendered on an HTML Canvas with cursor repulsion and click shockwaves.

## Features

- **Dot-based rendering** -- Samples an image and renders it as a grid of small square dots
- **Cursor repulsion** -- Dots near the mouse are pushed away with physics-based animation
- **Click shockwaves** -- Clicking sends an expanding ring that displaces dots as it passes
- **Spring-back easing** -- Dots smoothly animate back to their home positions
- **Inverted mode** -- Carve the image out as negative space inside a rounded-rect field of dots
- **Color preservation** -- Optionally retain original per-pixel colors on each dot
- **Framework-agnostic** -- Works with vanilla JS or React (component and hook exports)
- **Zero runtime dependencies** -- Only peer-depends on React (optional)
- **RSC-compatible** -- React entry points include `"use client"` directive for Next.js / React Server Components
- **Tree-shakeable subpath exports** -- Import only what you need (`/vanilla`, `/react`, or everything)

## Installation

```bash
# npm
npm install @dloss/dithered-image

# yarn
yarn add @dloss/dithered-image

# pnpm
pnpm add @dloss/dithered-image

# bun
bun add @dloss/dithered-image
```

## Usage

The library ships three subpath exports so you only pull in what you need:

| Import path | Contents | React required? |
| --- | --- | --- |
| `@dloss/dithered-image` | Everything (component + hook + vanilla) | Yes |
| `@dloss/dithered-image/react` | `DitheredImage` component + `useDitheredImage` hook | Yes |
| `@dloss/dithered-image/vanilla` | `createDitheredCanvas` function | No |

### React Component

The simplest way to use the library in React:

```tsx
import { DitheredImage } from "@dloss/dithered-image/react";

function App() {
  return (
    <DitheredImage
      src="/logo.png"
      invert
      style={{ width: 500, height: 500 }}
    />
  );
}
```

### React Hook

For more control over the canvas element:

```tsx
import { useDitheredImage } from "@dloss/dithered-image/react";

function Logo() {
  const canvasRef = useDitheredImage("/logo.png", { invert: true });
  return <canvas ref={canvasRef} style={{ width: 500, height: 500 }} />;
}
```

### Vanilla JavaScript

No React dependency -- attach the effect to any `<canvas>` element:

```ts
import { createDitheredCanvas } from "@dloss/dithered-image/vanilla";

const canvas = document.querySelector("canvas")!;
const cleanup = createDitheredCanvas(canvas, "/logo.png", {
  invert: true,
  gridSize: 200,
});

// Call cleanup() to remove event listeners and stop animation
```

> **Note:** The root import (`@dloss/dithered-image`) re-exports everything for backwards compatibility, but includes React as a dependency. Use the subpath imports above to keep your bundle minimal.

## Options

All options are optional. Pass them as props to `<DitheredImage>`, as the second argument to `useDitheredImage`, or as the third argument to `createDitheredCanvas`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `scale` | `number` | `0.5` | Logo size as a fraction of the canvas smaller dimension |
| `dotScale` | `number` | `1` | Multiplier for individual dot size |
| `invert` | `boolean` | `false` | `true` = dots fill around the logo; `false` = dots compose the logo |
| `gridSize` | `number` | `170` | Sampling grid resolution -- higher means more dots |
| `threshold` | `number` | `245` | Brightness cutoff (0--255) for logo pixel detection |
| `dotColor` | `string` | `"rgba(40, 40, 45, 0.9)"` | CSS color for the dots |
| `preserveColors` | `boolean` | `false` | Use original image pixel colors instead of `dotColor` |
| `mouseRadius` | `number` | `140` | Cursor repulsion zone radius in CSS pixels |
| `mouseForce` | `number` | `40` | Strength of cursor repulsion |
| `ease` | `number` | `0.12` | Spring-back speed -- lower values are floatier |
| `jitter` | `number` | `0.3` | Random position offset as a fraction of grid unit |
| `padding` | `number` | `0.22` | Padding around the logo bounding box (fraction) |
| `cornerRadius` | `number` | `0.15` | Rounded-rect corner radius (fraction, invert mode) |
| `shockwave` | `object` | -- | Click ripple settings (see below) |

### Shockwave Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `speed` | `number` | `225` | Expansion speed of the shockwave ring |
| `width` | `number` | `37` | Width of the shockwave ring |
| `strength` | `number` | `20` | Displacement strength |
| `duration` | `number` | `675` | Duration of the shockwave in milliseconds |

## License

MIT
