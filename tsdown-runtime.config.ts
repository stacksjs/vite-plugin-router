import { defineConfig } from "tsdown";
import { commonOptions } from "./tsdown.config";

export default defineConfig([
  {
    ...commonOptions,
    clean: false,
    entry: ["./src/runtime.ts"],
    external: [...commonOptions.external, "vite-plugin-router/types"],
  },

  {
    ...commonOptions,
    clean: false,
    entry: ["./src/data-loaders/entries/*"],
    // to work with node10 moduleResolution mode
    outDir: "dist/data-loaders",
    external: [
      ...commonOptions.external,
      "vite-plugin-router/types",
      "vite-plugin-router/runtime",
      "vite-plugin-router/data-loaders",
    ],
  },
]);
