import { fileTypeFromBuffer } from "file-type";
import { readFileSync, writeFileSync } from "fs";
import { getTextExtractor } from "office-text-extractor";
import { extname } from "path";

export async function docen(source: string, target: string): Promise<void> {
  const sourceContent = readFileSync(source);
  const sourceType = await fileTypeFromBuffer(sourceContent);

  if (
    (sourceType?.ext === "docx" || "pptx" || "xlsx" || "pdf") &&
    extname(target) === ".txt"
  ) {
    const extractor = getTextExtractor();
    const text = await extractor.extractText({
      input: sourceContent,
      type: "buffer",
    });
    writeFileSync(target, text);
  } else {
    console.error(`Unsupported source file type: ${sourceType?.ext}`);
  }
}
