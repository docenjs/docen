import { readFileSync, writeFileSync } from "fs";
import { CLI } from "@funish/cli";
import { extractText } from ".";

const cli = new CLI("docen");

cli.command({
  options: [
    {
      name: "source",
      alias: "s",
      description: "Source file",
    },
    {
      name: "target",
      alias: "t",
      description: "Target file",
    },
  ],
  action: async (argv) => {
    if (argv.source && argv.target) {
      const sourceBuffer = readFileSync(argv.source as string);

      const arrayBuffer = sourceBuffer.buffer.slice(sourceBuffer.byteOffset);

      const text = await extractText(arrayBuffer);
      writeFileSync(argv.target as string, text);
    } else {
      cli.help();
    }
  },
});

cli.version();

cli.help();
