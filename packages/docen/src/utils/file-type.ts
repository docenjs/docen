import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import { extname } from "path";

export async function detectFileType(source: string | ArrayBuffer) {
  let fileType;
  switch (typeof source) {
    case "string":
      fileType = await fileTypeFromFile(source);
      break;
    case "object":
      fileType = await fileTypeFromBuffer(source);
      break;
    default:
      throw new Error("Unsupported source type");
  }

  if (!fileType) {
    switch (typeof source) {
      case "string":
        fileType = {
          ext: extname(source).slice(1),
          mime: "application/octet-stream",
        };
        break;
      case "object": {
        // Check if it's a text file
        const buffer = Buffer.from(source);
        const isTxt = Buffer.compare(
          buffer.subarray(0, 3),
          Buffer.from([0xef, 0xbb, 0xbf]),
        );
        if (isTxt) {
          fileType = {
            ext: "txt",
            mime: "text/plain",
          };
        } else {
          throw new Error("Unsupported file type");
        }

        break;
      }
    }
  }

  return fileType;
}
