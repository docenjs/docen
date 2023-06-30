import { CLI } from "@funish/cli";
import { docen } from ".";

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
  action: (argv) => {
    if (argv.source && argv.target) {
      docen(argv.source as string, argv.target as string);
    } else {
      cli.help();
    }
  },
});

cli.version();

cli.help();
