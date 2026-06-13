import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { PDFDocument, PDFName } from 'pdf-lib';

/**
 * @fileOverview Utility to securely lock a PDF file using AES encryption.
 * We first use pdf-lib to "sanitize" the PDF, ensuring a clean buffer,
 * then apply encryption to prevent blank page issues.
 * 
 * Includes ViewerPreferences to ensure the PDF opens at a normal zoom level (FitWindow).
 */

export const lockPdf = async (file: File, password: string): Promise<Blob> => {
  try {
    // Step 1: Load the PDF with pdf-lib to sanitize and re-serialize it
    // This fixes issues where the original buffer might have weird offsets
    const originalBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
    
    // Step 2: Set Viewer Preferences to fix the "huge" display issue on open
    // This tells the PDF viewer to fit the document to the window.
    const catalog = pdfDoc.catalog;
    catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
        FitWindow: true,
        CenterWindow: true,
        DisplayDocTitle: true
    }));

    // Step 3: Save it to a fresh Uint8Array
    const sanitizedBytes = await pdfDoc.save();
    
    // Step 4: Encrypt the sanitized bytes
    // encryptPDF(pdfData, userPassword, ownerPassword)
    const encryptedBytes = await encryptPDF(sanitizedBytes, password, password);
    
    // Step 5: Return as Blob
    return new Blob([encryptedBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    throw error;
  }
};
