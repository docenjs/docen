import { extractText } from ".";
import { CLI } from "@funish/cli";
import { readFileSync, writeFileSync } from "fs";

const cli = new CLI("docen");

cli.command({
  options: [
    {
      name: "source",
      alias: "s",
      description: "Source directory",
    },
    {
      name: "target",
      alias: "t",
      description: "Target directory",
    },
  ],
  action: async (argv) => {
    if (argv.source && argv.target) {
      const text = await extractText(argv.source as string);
      writeFileSync(argv.target as string, text);
    } else {
      cli.help();
    }
  },
});

cli.version();

cli.help();
