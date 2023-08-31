import { getResolvedPDFJS } from "unpdf";

export async function extractTextFromPDF(pdfSource: ArrayBuffer) {
  // Load a PDF document.
  const { getDocument } = await getResolvedPDFJS();
  const loadingTask = getDocument(pdfSource);
  const pdf = await loadingTask.promise;

  // Get the number of pages.
  const numPages = pdf.numPages;

  // Get text-fragments
  let lastY = 0;
  let text = "";
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);

    const textContent = await page.getTextContent();

    // Content contains lots of information about the text layout and
    // styles, but we need only strings at the moment
    for (const item of textContent.items) {
      // @ts-ignore
      if (lastY === item.transform[5] || !lastY) {
        // @ts-ignore
        text += item.str;
      } else {
        // @ts-ignore
        text += "\n" + item.str;
      }
      // @ts-ignore
      lastY = item.transform[5];
    }
  }

  return text;
}
