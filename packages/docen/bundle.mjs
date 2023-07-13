import { execSync } from "child_process";
import { readFileSync } from "fs";

execSync("pnpm prepack", { stdio: "inherit" });

execSync("pnpm ncc build dist/cli.cjs -o dist/ncc", { stdio: "inherit" });

const version = readFileSync("package.json", "utf-8").match(
  /"version": "(.*?)"/,
)[1];

execSync(`mv dist/ncc/index.cjs dist/ncc/docen-${version}.cjs`, {
  stdio: "inherit",
});

execSync(
  `pnpm dlx pkg dist/ncc/docen-${version}.cjs --out-path dist/bundle -c pkg.config.json -C GZip`,
  {
    stdio: "inherit",
  },
);
