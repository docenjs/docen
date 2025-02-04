import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: [
    "src/index",
    "src/cli/index",
    "src/processors/pdf/index",
    "src/processors/docx/index",
    "src/processors/xlsx/index",
    "src/processors/csv/index",
    "src/processors/image/index",
    "src/processors/json/index",
  ],
  clean: true,
  failOnWarn: false,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      minify: true,
    },
  },
});
