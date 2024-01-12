import JSZIP from "jszip";

export async function extractImageFromDocx(docxSource: Uint8Array) {
  const files = (await JSZIP.loadAsync(docxSource))?.files;

  const images: {
    name: string;
    buffer: Uint8Array;
  }[] = [];

  for (const fileName in files) {
    if (fileName.startsWith("word/media/")) {
      images.push({
        name: fileName.replace("word/media/", ""),
        buffer: await files[fileName]?.async("uint8array"),
      });
    }
  }

  return images;
}
