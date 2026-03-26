import { Tabs } from "@base-ui/react/tabs";
import { DitheredImage } from "./lib";
import logoSrc from "./assets/universal-icon-light.png";
import googleSrc from "./assets/google-icon-logo-svgrepo-com.png";
import mcdonaldsSrc from "./assets/mcdonald-s-15-logo-svgrepo-com.png";
import whatsappSrc from "./assets/whatsapp-icon-logo-svgrepo-com.png";
import messengerSrc from "./assets/facebook-messenger-3-logo-svgrepo-com.svg";
import "./App.css";

const installCommands = {
  npm: "npm install @md/dithered-image",
  yarn: "yarn add @md/dithered-image",
  pnpm: "pnpm add @md/dithered-image",
  bun: "bun add @md/dithered-image",
};

const usageExamples = {
  Component: `import { DitheredImage } from "@md/dithered-image"

<DitheredImage
  src="/logo.png"
  invert
  style={{ width: 400, height: 400 }}
/>`,
  Hook: `import { useDitheredImage } from "@md/dithered-image"

function Logo() {
  const ref = useDitheredImage("/logo.png", {
    invert: true,
    mouseRadius: 140,
  })
  return <canvas ref={ref} style={{ width: 400, height: 400 }} />
}`,
  Vanilla: `import { createDitheredCanvas } from "@md/dithered-image"

const canvas = document.querySelector("canvas")
const cleanup = createDitheredCanvas(canvas, "/logo.png", {
  invert: true,
})

// later: cleanup()`,
};

const demos = [
  {
    title: "Inverted (default)",
    desc: "Logo as negative space inside a dot field.",
    src: logoSrc,
    options: { invert: true },
  },
  {
    title: "Direct",
    desc: "Dots compose the logo shape directly.",
    src: messengerSrc,
    options: { invert: false, threshold: 200, dotColor: "rgba(20, 20, 25, 0.9)" },
  },
  {
    title: "Preserved colors",
    desc: "Keep the original image colors on each dot.",
    src: googleSrc,
    options: { invert: false, preserveColors: true },
  },
  {
    title: "Dense grid",
    desc: "Higher grid resolution for a tighter, more solid look.",
    src: whatsappSrc,
    options: { invert: false, gridSize: 220, dotScale: 0.8, threshold: 230, dotColor: "rgba(30, 30, 35, 0.85)" },
  },
  {
    title: "Sparse & floaty",
    desc: "Fewer dots with low ease for a dreamy, slow-settling feel.",
    src: mcdonaldsSrc,
    options: { invert: false, gridSize: 100, ease: 0.04, jitter: 0.5, threshold: 220, preserveColors: true },
  },
  {
    title: "Custom color",
    desc: "Any CSS color string works for the dot fill.",
    src: logoSrc,
    options: { invert: true, dotColor: "rgba(99, 102, 241, 0.8)" },
  },
];

const apiRows = [
  ["invert", "boolean", "true", "Dots around logo (true) or dots as logo (false)"],
  ["scale", "number", "0.5", "Logo size as fraction of canvas"],
  ["gridSize", "number", "170", "Sampling grid resolution — more = denser"],
  ["dotScale", "number", "1", "Multiplier for dot size"],
  ["dotColor", "string", '"rgba(40,40,45,0.9)"', "CSS color for dots"],
  ["preserveColors", "boolean", "false", "Use original image colors per-dot"],
  ["mouseRadius", "number", "140", "Cursor repulsion radius (px)"],
  ["mouseForce", "number", "40", "Repulsion strength"],
  ["ease", "number", "0.12", "Spring-back speed (lower = floatier)"],
  ["jitter", "number", "0.3", "Random position offset (fraction of grid unit)"],
  ["padding", "number", "0.22", "Padding around logo (fraction of bbox)"],
  ["cornerRadius", "number", "0.15", "Outer rounded rect corner radius"],
  ["threshold", "number", "128", "Brightness cutoff for logo detection"],
];

function App() {
  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <DitheredImage src={logoSrc} className="hero-canvas" invert />
        <h1>dithered-image</h1>
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
              <pre className="code-block">{code}</pre>
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
        <div className="demo-grid">
          {demos.map((demo) => (
            <div className="demo-card" key={demo.title}>
              <DitheredImage
                src={demo.src}
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
