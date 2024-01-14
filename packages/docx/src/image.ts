import JSZIP from "jszip";

export async function extractImageFromDocx(source: Uint8Array) {
  const files = (await JSZIP.loadAsync(source))?.files;

  const images: {
    name: string;
    data: Uint8Array;
  }[] = [];

  for (const fileName in files) {
    if (fileName.startsWith("word/media/")) {
      images.push({
        name: fileName.replace("word/media/", ""),
        data: await files[fileName]?.async("uint8array"),
      });
    }
  }

  return images;
}
