
/**
 * @fileOverview Robust hybrid utility to convert DOCX to PDF.
 * Strategy:
 * 1. Attempt High-Quality Cloud Conversion via /api/docx-to-pdf.
 * 2. If Cloud fails (keys missing/limit reached), fallback to 100% Client-Side Engine.
 */

import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const convertDocxToPdf = async (file: File): Promise<boolean> => {
  // --- STRATEGY 1: ATTEMPT CLOUD API ---
  try {
    console.log('Attempting Cloud Conversion via API...');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/docx-to-pdf', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const pdfUrl = data.pdfUrl;
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      const originalName = file.name.replace('.docx', '').replace('.doc', '');
      link.download = `GR7-Tools-${originalName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Cloud Conversion Successful.');
      return true;
    } else {
        const err = await response.json();
        console.warn('Cloud API returned error, falling back to Local Engine:', err.error);
    }
  } catch (error) {
    console.warn('Cloud API connection failed, falling back to Local Engine.');
  }

  // --- STRATEGY 2: LOCAL FALLBACK (MAMMOTH.JS + JSPDF) ---
  try {
    console.log('Starting Local Client-Side Conversion...');
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Convert DOCX to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // 2. Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.width = '794px'; // A4 width
    container.style.padding = '40px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#333';
    container.style.fontFamily = 'Helvetica, Arial, sans-serif';
    container.style.lineHeight = '1.6';
    container.innerHTML = html;
    
    // Ensure all images in HTML are loaded before capture
    const images = container.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    }));

    document.body.appendChild(container);

    // 3. Capture HTML as Canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(container);

    // 4. Generate PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    const originalName = file.name.replace('.docx', '').replace('.doc', '');
    pdf.save(`GR7-Tools-${originalName}.pdf`);

    console.log('Local Conversion Successful.');
    return true;
  } catch (fallbackError) {
    console.error('Final Fallback Error:', fallbackError);
    throw new Error('All conversion methods failed. The file might be corrupted.');
  }
};
