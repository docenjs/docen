import { extractText } from ".";
import { CLI } from "@funish/cli";
import { readFileSync, writeFileSync } from "fs";
import { extname } from "path";

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
      const source = readFileSync(argv.source as string);

      const ext = extname(argv.source as string);

      const arrayBuffer = source.buffer.slice(source.byteOffset);

      const text = await extractText(arrayBuffer, {
        fileType: ext,
      });
      writeFileSync(argv.target as string, text);
    } else {
      cli.help();
    }
  },
});

cli.version();

cli.help();
