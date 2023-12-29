import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: ["src/index"],
  externals: ["canvas"],
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
    esbuild: {
      minify: true,
    },
  },
});
