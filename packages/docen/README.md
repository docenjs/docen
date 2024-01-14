# docen

![npm version](https://img.shields.io/npm/v/docen)
![npm downloads](https://img.shields.io/npm/dw/docen)
![npm license](https://img.shields.io/npm/l/docen)

> Programmatically and command-line implementation of document formatting, powered by Demo Macro.

## Features

- Work in both the browser and Node.js

## Getting started

```bash
# npm
$ npm install docen

# yarn
$ yarn add docen

# pnpm
$ pnpm add docen
```

## Usage

```ts
import { extractText } from "docen";
import { readFileSync, writeFileSync } from "fs";

const source = readFileSync("demo.pdf");

const arrayBuffer = source.buffer.slice(source.byteOffset);

const text = await extractText(arrayBuffer);

writeFileSync("demo.txt", text);
```

### CLI

```bash
Usage: docen [command] [options]

Options:
  -s, --source          Source file
  -t, --target          Target file
  -v, --version         Show version number
  -h, --help            Show help
```

## License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
