
/**
 * @fileOverview Utility to convert DOCX to PDF using server-side ConvertAPI.
 * This ensures high-fidelity results for complex Word documents.
 */

export const convertDocxToPdf = async (file: File): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/docx-to-pdf', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success && data.pdfUrl) {
      // PDF download link trigger karna
      const link = document.createElement('a');
      link.href = data.pdfUrl;
      const originalName = file.name.replace('.docx', '').replace('.doc', '');
      link.download = `${originalName}_converted.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } else {
      throw new Error(data.error || 'Conversion failed');
    }
  } catch (error) {
    console.error('Error converting DOCX to PDF:', error);
    throw error;
  }
};
