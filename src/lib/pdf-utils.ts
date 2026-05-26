import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';

/**
 * @fileOverview Utility to securely lock a PDF file using AES encryption.
 * This runs 100% client-side.
 */

export const lockPdf = async (file: File, password: string): Promise<Blob> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    
    // encryptPDF(pdfData, userPassword, ownerPassword)
    // Using the same password for both for standard user protection
    const encryptedBytes = await encryptPDF(pdfBytes, password, password);
    
    const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
    return blob;
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    throw error;
  }
};
