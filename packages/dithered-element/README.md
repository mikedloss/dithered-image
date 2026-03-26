# @dloss/dithered-element

Dither any React component or DOM element. Wraps [`@dloss/dithered-image`](https://www.npmjs.com/package/@dloss/dithered-image) with automatic DOM-to-canvas rasterization powered by [snapDOM](https://snapdom.dev).

## Installation

```bash
npm install @dloss/dithered-element @dloss/dithered-image
```

Both packages are required -- `@dloss/dithered-image` is a peer dependency that provides the dithering engine.

## Usage

### Basic

Wrap any React element. The component renders children off-screen, rasterizes them, and displays the dithered result.

```tsx
import { Dither } from "@dloss/dithered-element";

function App() {
  return (
    <Dither invert gridSize={200}>
      <Card title="Hello" subtitle="World" />
    </Dither>
  );
}
```

### Explicit size

By default, the canvas size is inferred from the children's rendered dimensions. Pass `width` and `height` to override.

```tsx
<Dither width={500} height={300} invert>
  <MyComponent />
</Dither>
```

### Optimizing re-snapshots

By default, children are re-rasterized on every render. Use the `deps` prop to control when re-snapshots happen (same mental model as `useEffect`).

```tsx
// Re-snapshot only when title or theme change
<Dither deps={[title, theme]} invert>
  <Card title={title} theme={theme} />
</Dither>

// Snapshot only on mount (never re-snapshots)
<Dither deps={[]} invert>
  <StaticContent />
</Dither>
```

### Imperative refresh

Use a ref to trigger re-snapshots manually.

```tsx
import { useRef } from "react";
import { Dither } from "@dloss/dithered-element";
import type { DitherHandle } from "@dloss/dithered-element";

function App() {
  const ref = useRef<DitherHandle>(null);

  return (
    <>
      <Dither ref={ref} deps={[]} invert>
        <Card title={title} />
      </Dither>
      <button onClick={() => ref.current?.refresh()}>
        Re-capture
      </button>
    </>
  );
}
```

## Props

All [`DitheredImageOptions`](https://www.npmjs.com/package/@dloss/dithered-image) are accepted as props (e.g. `invert`, `gridSize`, `dotColor`, `mouseRadius`, etc.), plus:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | -- | The element(s) to dither |
| `width` | `number` | inferred | Canvas width in CSS pixels |
| `height` | `number` | inferred | Canvas height in CSS pixels |
| `deps` | `DependencyList` | `undefined` | Controls re-snapshot timing. `undefined` = every render, `[]` = mount only |
| `className` | `string` | -- | Class name for the outer wrapper div |
| `style` | `CSSProperties` | -- | Style for the outer wrapper div |
| `ref` | `Ref<DitherHandle>` | -- | Exposes `.refresh()` for imperative re-capture |

## How it works

1. Children are rendered into a hidden container (in the DOM but invisible)
2. [snapDOM](https://snapdom.dev) serializes the container to an SVG and rasterizes it to a canvas
3. The rasterized image is passed as a data URL to `createDitheredCanvas` from `@dloss/dithered-image`
4. The dithering engine samples pixels and renders interactive dots with cursor repulsion and click shockwaves

## License

MIT
