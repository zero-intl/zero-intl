import { defineConfig } from "tsup";

export default defineConfig([
  // ESM build
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["react", "react-dom", "esbuild", "fsevents"],
    target: "es2020",
    outDir: "dist",
    outExtension: () => ({ js: ".mjs" }),
    // Explicitly exclude test files and dev dependencies
    esbuildOptions(options) {
      options.external = [
        ...options.external || [],
        "vitest",
        "@vitest/*",
        "@testing-library/*",
        "jsdom"
      ];
    }
  }
]);
