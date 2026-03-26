import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  banner: {
    js: '"use client";',
  },
});
