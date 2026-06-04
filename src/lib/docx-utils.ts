
/**
 * @fileOverview Utility to convert DOCX to PDF using server-side APIs.
 * This version calls the internal /api/docx-to-pdf route which uses
 * ConvertAPI and CloudConvert with the user's secret keys.
 */

export const convertDocxToPdf = async (file: File): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Call our internal API route that handles the 2 providers
    const response = await fetch('/api/docx-to-pdf', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      
      // The API returns a direct URL to the converted PDF
      const pdfUrl = data.pdfUrl;
      
      // Trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      const originalName = file.name.replace('.docx', '').replace('.doc', '');
      link.download = `GR7-Tools-${originalName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server conversion failed');
    }
  } catch (error: any) {
    console.error('Error converting DOCX to PDF via API:', error);
    throw error;
  }
};
