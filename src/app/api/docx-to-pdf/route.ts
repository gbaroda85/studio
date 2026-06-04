import { NextResponse } from 'next/server';

/**
 * @fileOverview Professional server-side DOCX to PDF conversion route.
 * This version uses direct REST API calls via fetch to bypass Node.js library 
 * filesystem checks, making it 100% compatible with serverless environments.
 */

export async function POST(req: Request) {
  const PROD_TOKEN = process.env.CONVERT_API_SECRET || "LDWZ4A1C9k1uSo7JBeoyfgSYvdyPWif7";
  const SANDBOX_TOKEN = "x7PtJTfCnxdSx5Ba5otIyDb9G4vkvMYy";

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Starting conversion flow for:', file.name);

    // --- STRATEGY 1: CONVERTAPI (PRODUCTION) ---
    let result = await callConvertApi(PROD_TOKEN, buffer, file.name);
    
    // --- STRATEGY 2: CONVERTAPI (SANDBOX FALLBACK) ---
    if (!result.success) {
      console.warn('Production API failed, trying Sandbox. Error:', result.error);
      result = await callConvertApi(SANDBOX_TOKEN, buffer, file.name);
    }

    if (result.success && result.pdfUrl) {
      return NextResponse.json({ 
        success: true, 
        pdfUrl: result.pdfUrl, 
        provider: result.provider 
      });
    }

    return NextResponse.json({ 
        error: 'All conversion providers failed.', 
        details: result.error 
    }, { status: 500 });

  } catch (error: any) {
    console.error('Final Fatal Conversion Failure:', error);
    return NextResponse.json({ 
      error: 'Server-side conversion failed.', 
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Helper to call ConvertAPI REST endpoint directly.
 * Using fetch ensures we don't hit "path must be a string" errors.
 */
async function callConvertApi(token: string, buffer: Buffer, filename: string) {
    try {
        const url = `https://v2.convertapi.com/convert/docx/to/pdf?Secret=${token}`;
        
        // We use the binary payload directly for the REST API
        const formData = new FormData();
        // Converting Buffer to Blob for standard fetch compatibility
        const fileBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        formData.append('File', fileBlob, filename);

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.Files && data.Files.length > 0) {
            return { 
                success: true, 
                pdfUrl: data.Files[0].Url, 
                provider: token.startsWith('x7') ? 'convertapi-sandbox' : 'convertapi-prod' 
            };
        }

        return { 
            success: false, 
            error: data.Message || `API returned status ${response.status}` 
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
