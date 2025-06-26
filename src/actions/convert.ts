'use server';

import * as pdfjs from 'pdfjs-dist';

// Set the worker source for pdfjs-dist. This is crucial for it to work in a non-browser environment like a server action.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

export async function convertPdfToDocx(pdfBuffer: ArrayBuffer): Promise<Buffer> {
  // Dynamically import 'html-to-docx' as it's a server-only library and this prevents bundling issues.
  const asBlob = (await import('html-to-docx')).default;

  try {
    const typedArray = new Uint8Array(pdfBuffer);
    const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
    let html = '<html><head><meta charset="UTF-8"></head><body>';
    let totalTextLength = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        if (textContent.items.length === 0) continue;

        totalTextLength += textContent.items.reduce((acc, item) => acc + ('str' in item ? item.str.length : 0), 0);

        let lastY: number | undefined;
        let pageText = '';
        // A simple heuristic to group text into lines based on Y-coordinate.
        textContent.items.forEach(item => {
            if('str' in item) {
                if (lastY !== undefined && (item.transform[5] < lastY - 5)) {
                    pageText += '<br/>';
                }
                pageText += item.str;
                lastY = item.transform[5];
            }
        });
        
        // Wrap lines in paragraph tags
        html += `<p>${pageText.replace(/<br\/>/g, '</p><p>')}</p>`;
        
        if (i < pdf.numPages) {
            html += '<br style="page-break-after: always;" />';
        }
    }
    
    if (totalTextLength < 20) { // Heuristic for image-only or empty PDFs
        throw new Error("This PDF appears to contain no text or only images, which cannot be converted to editable Word text with this tool.");
    }

    html += '</body></html>';

    const docxBlob: any = await asBlob(html, {
        orientation: 'portrait',
        margins: { top: 720, right: 720, bottom: 720, left: 720 }
    });
    
    const docxBuffer = await docxBlob.arrayBuffer();
    return Buffer.from(docxBuffer);

  } catch (error: any) {
    console.error("Error during PDF to DOCX conversion:", error);
    if (error.message.includes("PDF appears to contain no text")) {
        throw error;
    }
    throw new Error("Failed to convert PDF to DOCX. The file might be encrypted or have a complex structure.");
  }
}
