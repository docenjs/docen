import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "processors/pdf/index": "src/processors/pdf/index.ts",
    "processors/docx/index": "src/processors/docx/index.ts",
    "processors/xlsx/index": "src/processors/xlsx/index.ts",
    "processors/csv/index": "src/processors/csv/index.ts",
    "processors/image/index": "src/processors/image/index.ts",
    "processors/json/index": "src/processors/json/index.ts",
    cli: "src/cli/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  splitting: false,
  treeshake: true,
});
