import * as mammoth from 'mammoth';

/**
 * @fileOverview Utility to convert DOCX to PDF entirely in the browser.
 * Uses mammoth to convert DOCX to HTML, then html2pdf.js to render to PDF.
 */

export const convertDocxToPdf = async (file: File): Promise<boolean> => {
  try {
    // Dynamic import to avoid SSR issues with html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default;

    // 1. Read DOCX file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 2. Convert DOCX to HTML using mammoth
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const htmlContent = result.value;

    // 3. Configure styling to make the HTML look like a real document
    const styledHtml = `
      <div style="font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; line-height: 1.6; color: #333; background: white; min-height: 1000px;">
        ${htmlContent}
      </div>
    `;

    // 4. Configure html2pdf options
    const originalName = file.name.replace('.docx', '').replace('.doc', '');
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${originalName}_converted.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // 5. Generate and save PDF
    await html2pdf().set(options).from(styledHtml).save();
    return true;
  } catch (error) {
    console.error('Error converting DOCX to PDF:', error);
    throw error;
  }
};
