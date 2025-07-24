import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  dts: true,
  clean: true,
  sourcemap: false,
  minify: true,
  treeshake: true,
  external: [
    "intl-messageformat",
    "fsevents",
    "react",
    "react-dom",
    "esbuild",
    "fsevents",
    "vitest",
    "esbuild",
    "@vitest/*",
    "@vitejs/*",
    "@testing-library/*",
    "jsdom"
  ],
  outDir: "dist"
});
