/**
 * @fileOverview Professional Cloud utility to convert Word (DOC/DOCX) to PDF.
 * This utility relies on our internal API route which handles tokens and binary data.
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
        const errorMessage = data.error || 'Conversion failed.';
        const errorDetails = data.details || '';
        
        console.error('Server error details:', errorMessage, errorDetails);

        if (response.status === 401 || data.code === 'PASSWORD_REQUIRED') {
            throw new Error('PASSWORD_REQUIRED');
        }
        
        throw new Error(errorDetails || errorMessage);
    }
  } catch (error: any) {
    if (error.message === 'PASSWORD_REQUIRED') {
        throw error;
    }
    console.error('Conversion Utility Exception:', error.message);
    throw error; 
  }
};
