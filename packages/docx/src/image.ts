import JSZIP from "jszip";
import { type DataType, toUint8Array } from "undio";

export async function extractImageFromDocx(source: DataType) {
  const files = (await JSZIP.loadAsync(toUint8Array(source)))?.files;

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
