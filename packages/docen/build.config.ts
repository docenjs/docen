import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: ["src/index", "src/cli/index"],
  clean: true,
  failOnWarn: false,
  rollup: {
    emitCJS: true,
    // inlineDependencies: true,
    esbuild: {
      minify: true,
    },
  },
});
