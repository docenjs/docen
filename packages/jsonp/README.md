# @docen/jsonp

![npm version](https://img.shields.io/npm/v/@docen/jsonp)
![npm downloads](https://img.shields.io/npm/dw/@docen/jsonp)
![npm license](https://img.shields.io/npm/l/@docen/jsonp)

> Programmed implementation of jsonp format, powered by Demo Macro.

## Getting started

```bash
# npm
$ npm install @docen/jsonp

# yarn
$ yarn add @docen/jsonp

# pnpm
$ pnpm add @docen/jsonp
```

## Usage

```ts
import { convertJSONPToJSON } from "@docen/jsonp";

const jsonp = `callbackFunction({"key": "value"})`;

convertJSONPToJSON(jsonp);

// {"key": "value"}
```

## License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
