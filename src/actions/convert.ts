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

        totalTextLength += textContent.items.reduce((acc, item: any) => acc + (item.str?.length || 0), 0);
        
        const lines: { y: number, items: any[] }[] = [];
        const Y_TOLERANCE = 5;

        textContent.items.forEach((item: any) => {
            // Add guards to ensure item is a text item with valid transform data
            if (!item.str?.trim() || !Array.isArray(item.transform) || typeof item.transform[5] !== 'number') {
                return;
            }

            const y = item.transform[5];
            const line = lines.find(l => Math.abs(l.y - y) < Y_TOLERANCE);
            if (line) {
                line.items.push(item);
            } else {
                lines.push({ y, items: [item] });
            }
        });

        lines.sort((a, b) => b.y - a.y);
        
        lines.forEach(line => {
            line.items.sort((a, b) => (a.transform?.[4] || 0) - (b.transform?.[4] || 0));
            const lineText = line.items.map(item => item.str).join(' ');
            const escapedLineText = lineText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (escapedLineText.trim()) {
              html += `<p>${escapedLineText}</p>`;
            }
        });

        if (i < pdf.numPages) {
            html += '<br style="page-break-after: always;" />';
        }
    }
    
    if (totalTextLength < 20) {
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
    
    if (error.message?.includes("PDF appears to contain no text")) {
        throw error;
    }
    
    // Provide a more specific error message if possible
    let specificReason = "The file might be encrypted, contain only images, or have a complex structure.";
    if (error.name === 'PasswordException') {
        specificReason = 'The PDF is password-protected and cannot be opened.';
    } else if (error.name === 'InvalidPDFException') {
        specificReason = 'The PDF file appears to be invalid or corrupted.';
    }
    
    throw new Error(`Failed to convert PDF to DOCX. ${specificReason}`);
  }
}
