import { readFileSync, writeFileSync } from "node:fs";
import { defineCommand, runMain } from "@funish/cli";
import { extractText } from ".";

const main = defineCommand({
  meta: {
    name: "docen",
  },
  args: {
    source: {
      name: "source",
      alias: "s",
      description: "Source file",
    },
    target: {
      name: "target",
      alias: "t",
      description: "Target file",
    },
  },
  async run({ args }) {
    if (args.source && args.target) {
      const sourceBuffer = readFileSync(args.source as string);
      const text = await extractText(new Uint8Array(sourceBuffer));
      writeFileSync(args.target as string, text);
    }
  },
});

runMain(main);
