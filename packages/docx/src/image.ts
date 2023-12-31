import JSZIP from "jszip";

export async function extractImageFromDocx(docxSource: Uint8Array) {
  const files = Object.keys((await JSZIP.loadAsync(docxSource)).files);

  const images: {
    name: string;
    buffer: Uint8Array;
  }[] = [];

  for (const name of files) {
    if (name.startsWith("word/media/")) {
      const buffer = (await (await JSZIP.loadAsync(docxSource))
        .file(name)
        ?.async("uint8array")) as Uint8Array;

      images.push({
        name: name.replace("word/media/", ""),
        buffer,
      });
    }
  }

  return images;
}
