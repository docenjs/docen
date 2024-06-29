import { execSync } from "node:child_process";
import { readFileSync, rmdirSync } from "node:fs";

execSync("pnpm prepack", { stdio: "inherit" });

execSync("pnpm ncc build dist/cli.cjs -o .cache/ncc -a", { stdio: "inherit" });

const version = readFileSync("package.json", "utf-8").match(
  /"version": "(.*?)"/
)[1];

execSync(`mv .cache/ncc/index.cjs .cache/ncc/docen-${version}.js`, {
  stdio: "inherit",
});

execSync(
  `pnpm dlx pkg .cache/ncc/docen-${version}.js --out-path .cache/bundle -c pkg.config.json -C GZip`,
  {
    stdio: "inherit",
  }
);
