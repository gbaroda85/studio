/**
 * @fileOverview Professional Cloud-only utility to convert DOCX to PDF.
 * This utility relies exclusively on high-fidelity server-side conversion.
 */

export const convertDocxToPdf = async (file: File, password?: string): Promise<boolean> => {
  try {
    console.log('Initiating Cloud Conversion request for:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
        formData.append('password', password);
    }

    const response = await fetch('/api/docx-to-pdf', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const pdfUrl = data.pdfUrl;
      
      const link = document.createElement('a');
      link.href = pdfUrl;
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
        throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('Conversion Utility Error:', error.message);
    throw error; 
  }
};
