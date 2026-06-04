import { NextResponse } from 'next/server';

/**
 * @fileOverview Professional server-side Word to PDF conversion route.
 * Uses Direct REST API with Token authentication for maximum reliability.
 */

export async function POST(req: Request) {
  // Hardcoded Tokens provided by user for direct server execution
  const PROD_TOKEN = "LDWZ4A1C9k1uSo7JBeoyfgSYvdyPWif7";
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
    const fileName = file.name.toLowerCase();
    
    // Detect format for correct endpoint
    const format = fileName.endsWith('.docx') ? 'docx' : 'doc';

    console.log(`[Word-to-PDF] Starting Cloud Conversion for ${fileName}...`);

    // --- TRY PRODUCTION TOKEN FIRST ---
    let result = await callConvertApi(PROD_TOKEN, buffer, file.name, format, password);
    
    // --- FALLBACK TO SANDBOX TOKEN IF PROD FAILS ---
    if (!result.success) {
      // If error is password related, stop and ask user
      if (result.code === 401 || (result.error && result.error.toLowerCase().includes('password'))) {
          return NextResponse.json({ 
            error: 'File is password protected. Please supply the correct password.', 
            code: 'PASSWORD_REQUIRED' 
          }, { status: 401 });
      }
      
      console.warn(`[Word-to-PDF] Prod Token Failed (${result.error}). Trying Sandbox...`);
      result = await callConvertApi(SANDBOX_TOKEN, buffer, file.name, format, password);
    }

    if (result.success && result.pdfUrl) {
      console.log(`[Word-to-PDF] SUCCESS via ${result.provider}`);
      return NextResponse.json({ 
        success: true, 
        pdfUrl: result.pdfUrl, 
        provider: result.provider 
      });
    }

    return NextResponse.json({ 
        error: 'Cloud conversion failed.', 
        details: result.error || 'Token limit or network error.'
    }, { status: 500 });

  } catch (error: any) {
    console.error('[Word-to-PDF] Fatal Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Direct REST API call helper
 */
async function callConvertApi(token: string, buffer: Buffer, filename: string, format: string, password?: string) {
    try {
        let url = `https://v2.convertapi.com/convert/${format}/to/pdf?Token=${token}`;
        if (password) {
            url += `&Password=${encodeURIComponent(password)}`;
        }
        
        const apiFormData = new FormData();
        const mimeType = format === 'docx' 
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/msword';
            
        // Use File object to ensure cloud engine receives correct metadata
        const fileBlob = new File([buffer], filename, { type: mimeType });
        apiFormData.append('File', fileBlob);

        const response = await fetch(url, {
            method: 'POST',
            body: apiFormData,
        });

        const text = await response.text();
        let data: any = {};
        
        try {
            data = JSON.parse(text);
        } catch (e) {
            return { success: false, error: `Invalid JSON from cloud: ${text.substring(0, 50)}` };
        }

        if (response.ok && data.Files && data.Files.length > 0) {
            return { 
                success: true, 
                pdfUrl: data.Files[0].Url, 
                provider: token.startsWith("x7Pt") ? 'sandbox' : 'production' 
            };
        }

        return { 
            success: false, 
            error: data.Message || data.message || `Status ${response.status}`,
            code: response.status
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
