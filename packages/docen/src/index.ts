import { readFileSync, writeFileSync } from "fs";
import { extractRawText } from "mammoth";
import { extname } from "path";
import { fileTypeFromBuffer } from "file-type";

export async function docen(source: string, target: string): Promise<void> {
  const sourceContent = readFileSync(source);
  const sourceType = await fileTypeFromBuffer(sourceContent);

  if (sourceType?.ext === "docx" && extname(target) === ".txt") {
    extractRawText({ buffer: sourceContent }).then((result) => {
      writeFileSync(target, result.value);
    });
  } else {
    console.error(`Unsupported source file type: ${sourceType?.ext}`);
  }
}
