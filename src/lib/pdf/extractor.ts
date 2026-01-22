interface TextItem {
  str: string;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamically import pdfjs-dist only on client side
  const pdfjsLib = await import("pdfjs-dist");

  // Configure worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => (item as TextItem).str)
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n\n");
}
