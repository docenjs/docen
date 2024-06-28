import * as canvas from "canvas";
import { type DataType, toUint8Array } from "undio";
import { getResolvedPDFJS, renderPageAsImage } from "unpdf";

export async function extractImageFromPDF(
  source: DataType,
  options?: {
    pages?: number[];
  },
) {
  // Load a PDF document.
  const { getDocument, OPS } = await getResolvedPDFJS();
  const loadingTask = getDocument(Uint8Array.from(toUint8Array(source)));
  const pdf = await loadingTask.promise;

  // Get the number of pages.
  const numPages = pdf.numPages;

  const pages =
    options?.pages ?? Array.from({ length: numPages }, (_, i) => i + 1);

  const imageOperatorList: {
    page: number;
    name: string;
    index: number;
    data: Uint8Array;
  }[] = [];

  for (let i = 1; i <= pages.length; i++) {
    const page = await pdf.getPage(pages[i - 1]);

    const operatorList = await page.getOperatorList();

    operatorList.fnArray.map((f, index) => {
      if (f === OPS.paintImageXObject) {
        const imageName = operatorList.argsArray[index][0];

        page.objs.get(
          imageName,
          async (image: {
            width: number;
            height: number;
            data: ArrayLike<number>;
          }) => {
            const useCanvas = canvas.createCanvas(image.width, image.height);
            const ctx = useCanvas.getContext("2d");
            const imageData = ctx.createImageData(image.width, image.height);

            const data = new Uint8ClampedArray(image.width * image.height * 4);

            let k = 0;
            let i = 0;

            while (i < image.data.length) {
              data[k] = image.data[i];
              data[k + 1] = image.data[i + 1];
              data[k + 2] = image.data[i + 2];
              data[k + 3] = 255;

              i += 3;
              k += 4;
            }

            imageData.data.set(data);

            ctx.putImageData(imageData, 0, 0);

            imageOperatorList.push({
              page: pages[i - 1],
              name: imageName,
              index: index,
              data: useCanvas.toBuffer("image/png"),
            });
          },
        );
      }
    });
  }

  return imageOperatorList;
}

export async function convertPDFToImage(
  source: DataType,
  options?: {
    pages?: number[];
    canvas?: () => Promise<typeof canvas>;
  },
) {
  // Load a PDF document.
  const { getDocument } = await getResolvedPDFJS();
  const loadingTask = getDocument(Uint8Array.from(toUint8Array(source)));
  const pdf = await loadingTask.promise;

  // Get the number of pages.
  const numPages = pdf.numPages;

  // Render each page as an image
  const images = [];

  const pages =
    options?.pages ?? Array.from({ length: numPages }, (_, i) => i + 1);

  for (let i = 1; i <= pages.length; i++) {
    const image = await renderPageAsImage(
      Uint8Array.from(toUint8Array(source)),
      i,
      {
        canvas: options?.canvas,
      },
    );

    images.push(image);
  }

  return images;
}
