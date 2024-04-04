import { getResolvedPDFJS } from "unpdf";
import type { TextItem } from "unpdf/dist/types/src/display/api";

export async function extractTextFromPDF(
  source: Uint8Array,
  options?: {
    pages?: number[];
  },
) {
  // Load a PDF document.
  const { getDocument } = await getResolvedPDFJS();
  const loadingTask = getDocument(Uint8Array.from(source));
  const pdf = await loadingTask.promise;

  // Get the number of pages.
  const numPages = pdf.numPages;

  // Get text-fragments
  let lastY = 0;
  let text = "";

  const pages =
    options?.pages ?? Array.from({ length: numPages }, (_, i) => i + 1);

  for (let i = 1; i <= pages.length; i++) {
    const page = await pdf.getPage(pages[i - 1]);
    const textContent = await page.getTextContent();
    // Content contains lots of information about the text layout and
    // styles, but we need only strings at the moment
    for (const item of textContent.items as TextItem[]) {
      if (lastY === item.transform[5] || !lastY) {
        text += item.str;
      } else {
        text += `\n${item.str}`;
      }
      lastY = item.transform[5];
    }
  }

  return text;
}
