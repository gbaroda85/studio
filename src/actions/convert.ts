'use server';

import * as pdfjs from 'pdfjs-dist';

// Set the worker source for pdfjs-dist. This is crucial for it to work in a non-browser environment like a server action.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

export async function convertPdfToDocx(pdfBuffer: ArrayBuffer): Promise<Buffer> {
  // Dynamically import 'html-to-docx' as it's a server-only library and this prevents bundling issues.
  // Use the default export as suggested by build errors.
  const asBlob = (await import('html-to-docx')).default;

  try {
    const typedArray = new Uint8Array(pdfBuffer);
    const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
    let html = '<html><head><meta charset="UTF-8"></head><body>';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        if (textContent.items.length === 0) continue;

        let pageHtml = '';
        let currentY = -1;
        textContent.items.forEach(item => {
            if('str' in item) { // Check if it is a TextItem and not TextMarkedContent
                // A simple check for new lines based on Y-coordinate.
                if (currentY !== -1 && item.transform[5] < currentY - 5) {
                    pageHtml += '<br/>';
                }
                pageHtml += item.str;
                if (!item.str.endsWith(' ')) {
                    pageHtml += ' ';
                }
                currentY = item.transform[5];
            }
        });

        // Wrap extracted text in a paragraph tag.
        pageHtml = `<p>${pageHtml.replace(/\s+/g, ' ').trim()}</p>`;
        
        html += `<div>${pageHtml}</div>`;
        if (i < pdf.numPages) {
            // Add a page break for multi-page PDFs
            html += '<br style="page-break-after: always;" />';
        }
    }
    html += '</body></html>';

    const docxBlob: any = await asBlob(html);
    
    const docxBuffer = await docxBlob.arrayBuffer();
    return Buffer.from(docxBuffer);

  } catch (error) {
    console.error("Error during PDF to DOCX conversion:", error);
    throw new Error("Failed to convert PDF to DOCX. The file might be encrypted or have a complex structure.");
  }
}
