import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");
const outDir = resolve(__dirname, "../public");
const outPath = resolve(outDir, "llms.txt");

const header = `# dither

> Interactive dithered dot effects for the web. Turn any image or DOM element into a stipple field with cursor repulsion and click shockwaves.

- GitHub: https://github.com/mikedloss/dither
- Docs: https://dither-docs.vercel.app/

## Packages

- \`@dloss/dithered-core\` — Core dithering engine (Canvas 2D dot renderer with physics)
- \`@dloss/dithered-image\` — Dither images (React component, React hook, vanilla JS)
- \`@dloss/dithered-element\` — Dither any React component or DOM element

---
`;

const readmes = [
  "packages/dithered-image/README.md",
  "packages/dithered-element/README.md",
];

const sections = readmes.map((p) => readFileSync(resolve(root, p), "utf-8").trim());

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, [header, ...sections].join("\n\n---\n\n") + "\n");

console.log(`Generated ${outPath}`);
