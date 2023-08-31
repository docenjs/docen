import { fileTypeFromBuffer, fileTypeFromStream } from "file-type";

export async function detectFileType(source: ArrayBuffer) {
  let fileType;

  fileType = await fileTypeFromBuffer(source);

  if (!fileType) {
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
  }

  return fileType;
}
