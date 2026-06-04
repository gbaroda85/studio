import { NextResponse } from 'next/server';

/**
 * @fileOverview Professional server-side DOCX to PDF conversion route.
 * Handles both public and password-protected Word documents using ConvertAPI REST.
 */

export async function POST(req: Request) {
  const PROD_TOKEN = process.env.CONVERT_API_SECRET || "LDWZ4A1C9k1uSo7JBeoyfgSYvdyPWif7";
  const SANDBOX_TOKEN = "x7PtJTfCnxdSx5Ba5otIyDb9G4vkvMYy";

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Starting conversion flow for:', file.name, password ? '(Protected)' : '(Public)');

    // --- STRATEGY 1: CONVERTAPI (PRODUCTION) ---
    let result = await callConvertApi(PROD_TOKEN, buffer, file.name, password);
    
    // --- STRATEGY 2: CONVERTAPI (SANDBOX FALLBACK) ---
    if (!result.success) {
      // If error is specifically about password, don't try fallback yet, bubble up to user
      if (result.error.toLowerCase().includes('password')) {
          return NextResponse.json({ error: result.error }, { status: 401 });
      }
      
      console.warn('Production API failed, trying Sandbox. Error:', result.error);
      result = await callConvertApi(SANDBOX_TOKEN, buffer, file.name, password);
    }

    if (result.success && result.pdfUrl) {
      return NextResponse.json({ 
        success: true, 
        pdfUrl: result.pdfUrl, 
        provider: result.provider 
      });
    }

    return NextResponse.json({ 
        error: result.error || 'All conversion providers failed.', 
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
 */
async function callConvertApi(token: string, buffer: Buffer, filename: string, password?: string) {
    try {
        // Construct URL with optional Password parameter
        let url = `https://v2.convertapi.com/convert/docx/to/pdf?Secret=${token}`;
        if (password) {
            url += `&Password=${encodeURIComponent(password)}`;
        }
        
        const formData = new FormData();
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
