import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    splitting: false,
    minify: true,
    sourcemap: false,
    treeshake: true,
    skipNodeModulesBundle: true,
    treeshakable: true,
    external: [
      "react",
      "react-dom",
      "esbuild",
      "vitest",
      "esbuild",
      "@vitest/*",
      "@vitejs/*",
      "@testing-library/*",
      "jsdom",
      "@zero-intl/core",
      "intl-messageformat",
    ],
    target: "es2022",
    outDir: "dist"
  }
]);
