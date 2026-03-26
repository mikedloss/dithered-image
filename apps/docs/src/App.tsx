import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { DitheredImage } from "@dloss/dithered-image";
import { Dither } from "@dloss/dithered-element";
import { CodeBlock } from "./CodeBlock";
import heroSrc from "./assets/hero.png";
import udsSrc from "./assets/uds.png";
import googleSrc from "./assets/google-icon-logo-svgrepo-com.png";
import mcdonaldsSrc from "./assets/mcdonald-s-15-logo-svgrepo-com.png";
import whatsappSrc from "./assets/whatsapp-icon-logo-svgrepo-com.png";
import messengerSrc from "./assets/facebook-messenger-3-logo-svgrepo-com.svg";
import viteSrc from "./assets/vite.svg";
import reactSrc from "./assets/react.svg";
import "./App.css";

const logoOptions = [
  { label: "Hero", src: heroSrc },
  { label: "UDS", src: udsSrc },
  { label: "Google", src: googleSrc },
  { label: "McDonald's", src: mcdonaldsSrc },
  { label: "WhatsApp", src: whatsappSrc },
  { label: "Messenger", src: messengerSrc },
  { label: "Vite", src: viteSrc },
  { label: "React", src: reactSrc },
];

const installCommands = {
  npm: "npm install @dloss/dithered-image",
  yarn: "yarn add @dloss/dithered-image",
  pnpm: "pnpm add @dloss/dithered-image",
  bun: "bun add @dloss/dithered-image",
};

const usageExamples = {
  Component: `import { DitheredImage } from "@dloss/dithered-image"

<DitheredImage
  src="/logo.png"
  invert
  style={{ width: 400, height: 400 }}
/>`,
  Hook: `import { useDitheredImage } from "@dloss/dithered-image"

function Logo() {
  const ref = useDitheredImage("/logo.png", {
    invert: true,
    mouseRadius: 140,
  })
  return <canvas ref={ref} style={{ width: 400, height: 400 }} />
}`,
  Vanilla: `import { createDitheredCanvas } from "@dloss/dithered-image"

const canvas = document.querySelector("canvas")
const cleanup = createDitheredCanvas(canvas, "/logo.png", {
  invert: true,
})

// later: cleanup()`,
};

const demos = [
  {
    title: "Default",
    desc: "Dots compose the logo shape directly.",
  },
  {
    title: "Inverted",
    desc: "Logo as negative space inside a dot field.",
    options: { invert: true },
  },
  {
    title: "Preserved colors",
    desc: "Keep the original image colors on each dot.",
    options: { preserveColors: true },
  },
  {
    title: "Dense grid",
    desc: "Higher grid resolution for a tighter, more solid look.",
    options: { gridSize: 220, dotScale: 0.8 },
  },
  {
    title: "Sparse & floaty",
    desc: "Fewer dots with low ease for a dreamy, slow-settling feel.",
    options: { gridSize: 100, ease: 0.04, jitter: 0.5, preserveColors: true },
  },
  {
    title: "Custom color",
    desc: "Any CSS color string works for the dot fill.",
    options: { dotColor: "rgba(99, 102, 241, 0.8)" },
  },
];

const elementInstallCommands = {
  npm: "npm install @dloss/dithered-element @dloss/dithered-image",
  yarn: "yarn add @dloss/dithered-element @dloss/dithered-image",
  pnpm: "pnpm add @dloss/dithered-element @dloss/dithered-image",
  bun: "bun add @dloss/dithered-element @dloss/dithered-image",
};

const elementUsageExamples = {
  Basic: `import { Dither } from "@dloss/dithered-element"

<Dither invert gridSize={200}>
  <Card title="Hello" subtitle="World" />
</Dither>`,
  "With deps": `import { Dither } from "@dloss/dithered-element"

// Only re-snapshots when title changes
<Dither deps={[title]} invert>
  <Card title={title} />
</Dither>`,
  "With ref": `import { useRef } from "react"
import { Dither } from "@dloss/dithered-element"
import type { DitherHandle } from "@dloss/dithered-element"

const ref = useRef<DitherHandle>(null)

<Dither ref={ref} deps={[]} invert>
  <Card title={title} />
</Dither>
<button onClick={() => ref.current?.refresh()}>
  Re-capture
</button>`,
};

const elementApiRows = [
  ["children", "ReactNode", "—", "The element(s) to dither"],
  ["width", "number", "inferred", "Canvas width in CSS pixels"],
  ["height", "number", "inferred", "Canvas height in CSS pixels"],
  ["deps", "DependencyList", "undefined", "Re-snapshot timing: undefined = every render, [] = mount only"],
  ["className", "string", "—", "Class name for the outer wrapper div"],
  ["style", "CSSProperties", "—", "Style for the outer wrapper div"],
  ["ref", "Ref<DitherHandle>", "—", "Exposes .refresh() for imperative re-capture"],
];

const apiRows = [
  ["invert", "boolean", "false", "Dots around logo (true) or dots as logo (false)"],
  ["scale", "number", "0.5", "Logo size as fraction of canvas"],
  ["gridSize", "number", "170", "Sampling grid resolution - more = denser"],
  ["dotScale", "number", "1", "Multiplier for dot size"],
  ["dotColor", "string", '"rgba(40,40,45,0.9)"', "CSS color for dots"],
  ["preserveColors", "boolean", "false", "Use original image colors per-dot"],
  ["mouseRadius", "number", "140", "Cursor repulsion radius (px)"],
  ["mouseForce", "number", "40", "Repulsion strength"],
  ["ease", "number", "0.12", "Spring-back speed (lower = floatier)"],
  ["jitter", "number", "0.3", "Random position offset (fraction of grid unit)"],
  ["padding", "number", "0.22", "Padding around logo (fraction of bbox)"],
  ["cornerRadius", "number", "0.15", "Outer rounded rect corner radius"],
  ["threshold", "number", "245", "Brightness cutoff for logo detection"],
  ["shockwave.speed", "number", "225", "Expansion speed of the shockwave ring"],
  ["shockwave.width", "number", "37", "Width of the shockwave ring"],
  ["shockwave.strength", "number", "20", "Displacement strength of the shockwave"],
  ["shockwave.duration", "number", "675", "Duration of the shockwave (ms)"],
];

function App() {
  const [selectedLogo, setSelectedLogo] = useState(0);
  const currentSrc = logoOptions[selectedLogo].src;

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <DitheredImage src={currentSrc} className="hero-canvas" preserveColors />
        <h1>dither</h1>
        <p>
          Interactive dithered image effect for the web. Any image becomes a
          stipple field with cursor repulsion and click shockwaves. Vanilla JS
          core, React bindings included.
        </p>
        <div className="hero-badges">
          <span className="badge">~4 KB gzipped</span>
          <span className="badge">0 dependencies</span>
          <span className="badge">Canvas 2D</span>
          <span className="badge">React / Vanilla</span>
        </div>
        <div className="hero-links">
          <a href="https://github.com/mikedloss/dither" target="_blank" rel="noopener noreferrer" className="hero-link">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/@dloss/dithered-image" target="_blank" rel="noopener noreferrer" className="hero-link">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M0 0v16h16V0H0zm13 13h-2V5H8v8H3V3h10v10z" /></svg>
            npm
          </a>
        </div>
      </section>

      {/* Install */}
      <section className="section">
        <div className="section-header">
          <h2>Quick start</h2>
        </div>

        <Tabs.Root defaultValue="npm" className="tabs">
          <Tabs.List className="tabs-list">
            {Object.keys(installCommands).map((pm) => (
              <Tabs.Tab key={pm} value={pm} className="tabs-tab">
                {pm}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="tabs-indicator" />
          </Tabs.List>
          {Object.entries(installCommands).map(([pm, cmd]) => (
            <Tabs.Panel key={pm} value={pm} className="tabs-panel">
              <code className="install-code">{cmd}</code>
            </Tabs.Panel>
          ))}
        </Tabs.Root>

        <Tabs.Root defaultValue="Component" className="tabs" style={{ marginTop: 32 }}>
          <Tabs.List className="tabs-list">
            {Object.keys(usageExamples).map((label) => (
              <Tabs.Tab key={label} value={label} className="tabs-tab">
                {label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="tabs-indicator" />
          </Tabs.List>
          {Object.entries(usageExamples).map(([label, code]) => (
            <Tabs.Panel key={label} value={label} className="tabs-panel">
              <CodeBlock code={code} />
            </Tabs.Panel>
          ))}
        </Tabs.Root>
      </section>

      {/* Demos */}
      <section className="section">
        <div className="section-header">
          <h2>Demos</h2>
          <p>Move your mouse over each canvas. Click for a shockwave.</p>
        </div>
        <Tabs.Root
          value={selectedLogo}
          onValueChange={(v) => setSelectedLogo(v as number)}
          className="tabs"
          style={{ marginBottom: 24 }}
        >
          <Tabs.List className="tabs-list">
            {logoOptions.map((logo, i) => (
              <Tabs.Tab key={logo.label} value={i} className="tabs-tab logo-tab">
                <img src={logo.src} alt={logo.label} className="logo-tab-icon" />
                {logo.label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="tabs-indicator" />
          </Tabs.List>
        </Tabs.Root>
        <div className="demo-grid">
          {demos.map((demo) => (
            <div className="demo-card" key={demo.title}>
              <DitheredImage
                src={currentSrc}
                className="demo-canvas-wrap"
                {...demo.options}
              />
              <div className="demo-info">
                <h3>{demo.title}</h3>
                <p>{demo.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dither Elements */}
      <section className="section">
        <div className="section-header">
          <h2>Dither any element</h2>
          <p>
            Use <code>@dloss/dithered-element</code> to dither any React component or DOM element.
            It rasterizes children automatically using <a href="https://snapdom.dev" target="_blank" rel="noopener noreferrer">snapDOM</a>.
          </p>
        </div>

        <Tabs.Root defaultValue="npm" className="tabs">
          <Tabs.List className="tabs-list">
            {Object.keys(elementInstallCommands).map((pm) => (
              <Tabs.Tab key={pm} value={pm} className="tabs-tab">
                {pm}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="tabs-indicator" />
          </Tabs.List>
          {Object.entries(elementInstallCommands).map(([pm, cmd]) => (
            <Tabs.Panel key={pm} value={pm} className="tabs-panel">
              <code className="install-code">{cmd}</code>
            </Tabs.Panel>
          ))}
        </Tabs.Root>

        <Tabs.Root defaultValue="Basic" className="tabs" style={{ marginTop: 32 }}>
          <Tabs.List className="tabs-list">
            {Object.keys(elementUsageExamples).map((label) => (
              <Tabs.Tab key={label} value={label} className="tabs-tab">
                {label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="tabs-indicator" />
          </Tabs.List>
          {Object.entries(elementUsageExamples).map(([label, code]) => (
            <Tabs.Panel key={label} value={label} className="tabs-panel">
              <CodeBlock code={code} />
            </Tabs.Panel>
          ))}
        </Tabs.Root>

        <div className="demo-grid" style={{ marginTop: 32 }}>
          <div className="demo-card">
            <Dither className="demo-canvas-wrap" invert gridSize={170}>
              <div className="dither-demo-content">
                <div className="dither-demo-icon">D</div>
                <div className="dither-demo-text">
                  <strong>dithered-element</strong>
                  <span>This is a plain HTML element, dithered.</span>
                </div>
              </div>
            </Dither>
            <div className="demo-info">
              <h3>HTML element</h3>
              <p>A styled div wrapped in {"<Dither>"} with invert mode.</p>
            </div>
          </div>
          <div className="demo-card">
            <Dither className="demo-canvas-wrap" gridSize={200} preserveColors>
              <div className="dither-demo-content dither-demo-colorful">
                <div className="dither-demo-gradient" />
                <div className="dither-demo-text">
                  <strong>Preserved colors</strong>
                  <span>Original colors from the element are kept.</span>
                </div>
              </div>
            </Dither>
            <div className="demo-info">
              <h3>Color preserved</h3>
              <p>Element colors carried through to each dot.</p>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto", marginTop: 32 }}>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
            All <code>@dloss/dithered-image</code> options are also accepted as props, plus:
          </p>
          <table className="api-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {elementApiRows.map(([prop, type, def, desc]) => (
                <tr key={prop}>
                  <td><code>{prop}</code></td>
                  <td><code>{type}</code></td>
                  <td><code>{def}</code></td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* API */}
      <section className="section">
        <div className="section-header">
          <h2>Options</h2>
          <p>Works with zero config. Tune these to dial in the exact feel you want.</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="api-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {apiRows.map(([prop, type, def, desc]) => (
                <tr key={prop}>
                  <td><code>{prop}</code></td>
                  <td><code>{type}</code></td>
                  <td><code>{def}</code></td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer">
        <p>
          Logos shown in demos are trademarks of their respective owners, used
          for demonstration purposes only. Logo assets sourced
          from <a href="https://www.svgrepo.com" target="_blank" rel="noopener noreferrer">SVG Repo</a>.
        </p>
      </footer>
    </div>
  );
}

export default App;
