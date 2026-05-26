import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { PDFDocument } from 'pdf-lib';

/**
 * @fileOverview Utility to securely lock a PDF file using AES encryption.
 * We first use pdf-lib to "sanitize" the PDF, ensuring a clean buffer,
 * then apply encryption to prevent blank page issues.
 */

export const lockPdf = async (file: File, password: string): Promise<Blob> => {
  try {
    // Step 1: Load the PDF with pdf-lib to sanitize and re-serialize it
    // This fixes issues where the original buffer might have weird offsets
    const originalBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
    
    // Step 2: Save it to a fresh Uint8Array
    const sanitizedBytes = await pdfDoc.save();
    
    // Step 3: Encrypt the sanitized bytes
    // encryptPDF(pdfData, userPassword, ownerPassword)
    const encryptedBytes = await encryptPDF(sanitizedBytes, password, password);
    
    // Step 4: Return as Blob
    return new Blob([encryptedBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    throw error;
  }
};
