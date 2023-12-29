import * as canvas from "canvas";
import { getResolvedPDFJS, renderPageAsImage } from "unpdf";

export async function convertPDFToImage(
  pdfSource: Uint8Array,
  options?: {
    pages?: number[];
    canvas?: () => Promise<typeof canvas>;
  },
) {
  // Load a PDF document.
  const { getDocument } = await getResolvedPDFJS();
  const loadingTask = getDocument(Uint8Array.from(pdfSource));
  const pdf = await loadingTask.promise;

  // Get the number of pages.
  const numPages = pdf.numPages;

  // Render each page as an image
  const images = [];

  const pages =
    options?.pages ?? Array.from({ length: numPages }, (_, i) => i + 1);

  for (let i = 1; i <= pages.length; i++) {
    const image = await renderPageAsImage(Uint8Array.from(pdfSource), i, {
      canvas: options?.canvas,
    });

    images.push(image);
  }

  return images;
}
