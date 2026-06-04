
/**
 * @fileOverview Utility to convert DOCX to PDF 100% on the client side.
 * Uses mammoth.js to convert DOCX to HTML, then html2canvas and jsPDF to generate PDF.
 * This preserves privacy and removes reliance on external server APIs.
 */

import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const convertDocxToPdf = async (file: File): Promise<boolean> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Convert DOCX to HTML using Mammoth
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // 2. Create a hidden container to render the HTML for capture
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-10000px';
    container.style.left = '-10000px';
    container.style.width = '794px'; // A4 width at 96 DPI
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.color = '#000000';
    container.innerHTML = `
      <style>
        body { font-family: sans-serif; line-height: 1.6; }
        p { margin-bottom: 1em; }
        h1, h2, h3 { color: #333; margin-top: 1.5em; margin-bottom: 0.5em; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        td, th { border: 1px solid #ddd; padding: 8px; }
      </style>
      ${html}
    `;
    document.body.appendChild(container);

    // 3. Render container to Canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false
    });

    // 4. Remove container
    document.body.removeChild(container);

    // 5. Generate PDF from Canvas
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
    
    // 6. Trigger Download
    const originalName = file.name.replace('.docx', '').replace('.doc', '');
    pdf.save(`GR7-Tools-${originalName}.pdf`);

    return true;
  } catch (error) {
    console.error('Error converting DOCX to PDF on client:', error);
    throw error;
  }
};
