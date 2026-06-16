import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { PDFDocument, PDFName } from 'pdf-lib';

/**
 * @fileOverview Utility to securely lock a PDF file using AES encryption.
 * 
 * FIX: To prevent blank pages, we save the PDF using standard object streams 
 * which ensures compatibility with the encryption engine.
 * 
 * Includes ViewerPreferences to ensure the PDF opens at a normal zoom level (FitWindow).
 */

export const lockPdf = async (file: File, password: string): Promise<Blob> => {
  try {
    // Step 1: Load the PDF with pdf-lib to sanitize and re-serialize it
    const originalBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
    
    // Step 2: Set Viewer Preferences to fix the "huge" display issue on open
    const catalog = pdfDoc.catalog;
    catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
        FitWindow: true,
        CenterWindow: true,
        DisplayDocTitle: true
    }));

    // Step 3: Save it with specific compatibility flags
    // CRITICAL: useObjectStreams: false prevents structural corruption during encryption
    const sanitizedBytes = await pdfDoc.save({ 
      useObjectStreams: false,
      addDefaultPage: false
    });
    
    // Step 4: Encrypt the sanitized bytes
    const encryptedBytes = await encryptPDF(sanitizedBytes, password, password);
    
    // Step 5: Return as Blob
    return new Blob([encryptedBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    throw error;
  }
};
