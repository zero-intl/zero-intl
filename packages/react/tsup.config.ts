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
      "@vitest/*",
      "@vitejs/*",
      "@testing-library/*",
      "jsdom",
      "@zero-intl/core",
    ],
    target: "es2022",
    outDir: "dist"
  }
]);
