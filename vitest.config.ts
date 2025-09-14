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
      "@docen/ooxast": resolve(__dirname, "./packages/ooxast/src"),
      "@docen/wmlast": resolve(__dirname, "./packages/wmlast/src"),
      "@docen/smlast": resolve(__dirname, "./packages/smlast/src"),
      "@docen/pmlast": resolve(__dirname, "./packages/pmlast/src"),
      "@docen/wmlast-util-from-docx": resolve(
        __dirname,
        "./packages/wmlast-util-from-docx/src",
      ),
    },
  },
});
