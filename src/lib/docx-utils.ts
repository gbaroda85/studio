/**
 * @fileOverview Professional Cloud utility to convert Word (DOC/DOCX) to PDF.
 * This utility relies on our internal API route which handles tokens and binary data securely.
 */

export const convertDocxToPdf = async (file: File, password?: string): Promise<boolean> => {
  try {
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
      // The API returns a secure direct URL to the converted PDF
      const pdfUrl = data.pdfUrl;
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      link.download = `GR7-Tools-${originalName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } else {
        const errorMessage = data.error || 'Conversion failed at server side.';
        const errorDetails = data.details || '';
        
        // Log the actual detailed error for debugging
        console.error('Server side error report:', errorMessage, errorDetails);

        // If server says password is required, bubble up specific error
        if (response.status === 401 || data.code === 'PASSWORD_REQUIRED') {
            throw new Error('PASSWORD_REQUIRED');
        }
        
        throw new Error(errorDetails || errorMessage);
    }
  } catch (error: any) {
    if (error.message === 'PASSWORD_REQUIRED') {
        throw error;
    }
    console.error('Conversion Utility Error:', error.message);
    throw error; 
  }
};
