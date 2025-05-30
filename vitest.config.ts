import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["**/*.ts"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/test/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        "playground/**",
      ],
    },
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      docen: resolve(__dirname, "./packages/docen/src"),
      "@docen/core": resolve(__dirname, "./packages/core/src"),
      "@docen/document": resolve(__dirname, "./packages/document/src"),
      "@docen/data": resolve(__dirname, "./packages/data/src"),
      "@docen/media": resolve(__dirname, "./packages/media/src"),
      "@docen/office": resolve(__dirname, "./packages/office/src"),
      "@docen/containers": resolve(__dirname, "./packages/containers/src"),
      "@docen/editor": resolve(__dirname, "./packages/editor/src"),
      "@docen/providers": resolve(__dirname, "./packages/providers/src"),
    },
  },
});
