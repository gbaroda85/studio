import { NextResponse } from 'next/server';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * @fileOverview Production-ready API route to add text watermarks to PDF documents.
 * 
 * Logic:
 * 1. Accepts FormData with 'file' (PDF) and 'text' (Watermark string).
 * 2. Loads the PDF using pdf-lib.
 * 3. Iterates through every page, dynamically fetching width and height.
 * 4. Calculates the center point using rotation math for -45 degrees.
 * 5. Applies light-grey professional styling with 0.3 opacity.
 */

export async function POST(req: Request) {
  try {
    // 1. Extract and Validate Input
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const watermarkText = formData.get('text') as string;

    if (!file || !watermarkText) {
      return NextResponse.json(
        { error: 'Missing required inputs: file and text are mandatory.' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF documents are supported.' },
        { status: 400 }
      );
    }

    // 2. Load PDF Document
    const pdfBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Embed standard font to avoid external loading issues
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    // 3. Watermark Configuration
    const fontSize = 50;
    const rotationDegrees = -45;
    const rotationRadians = (rotationDegrees * Math.PI) / 180;
    
    // Pre-calculate trig values for centering math
    const cos = Math.cos(rotationRadians);
    const sin = Math.sin(rotationRadians);

    // 4. Process Each Page
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Get exact text metrics
      const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = helveticaFont.heightAtSize(fontSize);

      /**
       * Centering Formula:
       * We want the center of the rotated text bounding box to align with the page center.
       * Contribution of width/height to horizontal/vertical span changes with rotation.
       */
      const x = (width - (textWidth * cos) + (textHeight * sin)) / 2;
      const y = (height - (textHeight * cos) - (textWidth * sin)) / 2;

      page.drawText(watermarkText, {
        x,
        y,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5), // Professional Light Grey
        opacity: 0.3,             // Subtle transparent look
        rotate: degrees(rotationDegrees),
      });
    }

    // 5. Finalize and Return
    const watermarkedPdfBytes = await pdfDoc.save();

    return new Response(watermarkedPdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="watermarked_${file.name}"`,
      },
    });

  } catch (error: any) {
    console.error('PDF Watermark API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to apply watermark to the document.', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
