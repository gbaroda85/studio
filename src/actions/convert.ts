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
    let hasContent = false; // Use a flag instead of text length

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Filter for valid text items first
        const validItems = textContent.items.filter((item: any) => 
            item.str?.trim() && 
            Array.isArray(item.transform) && 
            typeof item.transform[5] === 'number'
        );

        if (validItems.length === 0) {
            continue;
        }
        
        const lines: { y: number, items: any[] }[] = [];
        const Y_TOLERANCE = 5;

        validItems.forEach((item: any) => {
            const y = item.transform[5];
            const line = lines.find(l => Math.abs(l.y - y) < Y_TOLERANCE);
            if (line) {
                line.items.push(item);
            } else {
                lines.push({ y, items: [item] });
            }
        });

        if (lines.length > 0) {
            hasContent = true;
        }

        lines.sort((a, b) => b.y - a.y);
        
        lines.forEach(line => {
            line.items.sort((a, b) => (a.transform?.[4] || 0) - (b.transform?.[4] || 0));
            const lineText = line.items.map(item => item.str).join(' ');
            const escapedLineText = lineText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (escapedLineText.trim()) {
              html += `<p>${escapedLineText}</p>`;
            }
        });

        if (i < pdf.numPages && lines.length > 0) {
            html += '<br style="page-break-after: always;" />';
        }
    }
    
    if (!hasContent) {
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
    
    let specificReason = "The file might be encrypted, contain only images, or have a complex structure.";
    if (error.name === 'PasswordException') {
        specificReason = 'The PDF is password-protected and cannot be opened.';
    } else if (error.name === 'InvalidPDFException') {
        specificReason = 'The PDF file appears to be invalid or corrupted.';
    }
    
    throw new Error(`Failed to convert PDF to DOCX. ${specificReason}`);
  }
}
