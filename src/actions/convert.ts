'use server';

import * as pdfjs from 'pdfjs-dist';

export async function convertPdfToDocx(pdfBuffer: ArrayBuffer): Promise<Buffer> {
  // Use the default export as suggested by the build error hint.
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
            if('str' in item) {
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

        pageHtml = `<p>${pageHtml.replace(/\s+/g, ' ').trim()}</p>`;
        
        html += `<div>${pageHtml}</div>`;
        if (i < pdf.numPages) {
            html += '<br style="page-break-after: always;" />';
        }
    }
    html += '</body></html>';

    const docxBlob: any = await asBlob(html);
    
    const docxBuffer = await docxBlob.arrayBuffer();
    return Buffer.from(docxBuffer);

  } catch (error) {
    console.error("Error during PDF to DOCX conversion:", error);
    throw new Error("Failed to convert PDF to DOCX.");
  }
}
