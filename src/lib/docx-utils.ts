/**
 * @fileOverview Professional Cloud-only utility to convert Word (DOC/DOCX) to PDF.
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

    const data = await response.json();

    if (response.ok && data.success) {
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
        const errorMessage = data.error || 'Conversion failed at server side.';
        const errorDetails = data.details || '';
        
        console.error('Server side error details:', errorMessage, errorDetails);

        if (response.status === 401) {
            throw new Error('PASSWORD_REQUIRED');
        }
        
        throw new Error(errorMessage);
    }
  } catch (error: any) {
    if (error.message === 'PASSWORD_REQUIRED') {
        throw error;
    }
    // Log the actual error that reached the utility
    console.error('Conversion Utility Error:', error.message);
    throw error; 
  }
};
