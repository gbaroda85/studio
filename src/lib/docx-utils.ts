/**
 * @fileOverview Professional Cloud-only utility to convert DOCX to PDF.
 * This utility relies exclusively on high-fidelity server-side conversion via:
 * 1. ConvertAPI (Primary)
 * 2. CloudConvert (Fallback)
 * 
 * No local/browser-based fallback is used to ensure 100% layout preservation.
 */

export const convertDocxToPdf = async (file: File): Promise<boolean> => {
  try {
    console.log('Initiating Cloud Conversion request for:', file.name);
    
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
      // Get base name without extension
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      link.download = `GR7-Tools-${originalName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Cloud Conversion Successful. Provider:', data.provider);
      return true;
    } else {
        const errData = await response.json();
        const errorMessage = errData.error || 'Conversion failed at server side.';
        console.error('Server Error:', errorMessage, errData.details || '');
        throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('Final Conversion Failure:', error.message);
    throw error; // Re-throw to be caught by the UI toast
  }
};
