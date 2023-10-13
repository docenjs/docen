import { readFileSync, writeFileSync } from "fs";
import { extractText } from "docen";

const pdfSource = readFileSync("demo.pdf");

const arrayBuffer = pdfSource.buffer.slice(pdfSource.byteOffset);

const text = await extractText(arrayBuffer);

writeFileSync("demo.txt", text);
