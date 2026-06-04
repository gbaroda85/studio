/**
 * @fileOverview Professional Cloud-only utility to convert Word (DOC/DOCX) to PDF.
 * This utility relies on our internal API route which handles token rotation and encryption.
 */

export const convertDocxToPdf = async (file: File, password?: string): Promise<boolean> => {
  try {
    console.log('Initiating Secure Cloud Conversion for:', file.name);
    
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
      
      console.log('Cloud Conversion Successful. Engine:', data.provider);
      return true;
    } else {
        const errorMessage = data.error || 'Conversion failed.';
        const errorDetails = data.details || 'Check API token validity.';
        
        // Detailed console report for debugging
        console.error('Server side error report:', errorMessage, '| Details:', errorDetails);

        // If server says password is required, bubble up specific error
        if (response.status === 401 || data.code === 'PASSWORD_REQUIRED') {
            throw new Error('PASSWORD_REQUIRED');
        }
        
        // Provide the real technical reason to the UI toast
        throw new Error(errorDetails.length > 5 ? errorDetails : errorMessage);
    }
  } catch (error: any) {
    if (error.message === 'PASSWORD_REQUIRED') {
        throw error;
    }
    // Final error bubble
    console.error('Conversion Utility Exception:', error.message);
    throw error; 
  }
};
