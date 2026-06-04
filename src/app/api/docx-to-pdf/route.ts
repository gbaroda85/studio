import { NextResponse } from 'next/server';

/**
 * @fileOverview Professional server-side Word to PDF conversion route.
 * Updated to use Token authentication as per ConvertAPI support recommendation.
 * Tokens provided by user: 
 * PROD: LDWZ4A1C9k1uSo7JBeoyfgSYvdyPWif7
 * SANDBOX: x7PtJTfCnxdSx5Ba5otIyDb9G4vkvMYy
 */

export async function POST(req: Request) {
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

    console.log(`[Word-to-PDF] Converting ${format.toUpperCase()} using Token Auth...`);

    // --- TRY PRODUCTION TOKEN ---
    let result = await callConvertApi(PROD_TOKEN, buffer, file.name, format, password);
    
    // --- FALLBACK TO SANDBOX TOKEN ---
    if (!result.success) {
      // Check for password error
      if (result.code === 401 || (result.error && result.error.toLowerCase().includes('password'))) {
          return NextResponse.json({ 
            error: 'File is password protected. Please supply the correct password.', 
            code: 'PASSWORD_REQUIRED' 
          }, { status: 401 });
      }
      
      console.warn(`[Word-to-PDF] Production Token failed: ${result.error}. Trying Sandbox Token...`);
      result = await callConvertApi(SANDBOX_TOKEN, buffer, file.name, format, password);
    }

    if (result.success && result.pdfUrl) {
      console.log(`[Word-to-PDF] Success via ${result.provider}`);
      return NextResponse.json({ 
        success: true, 
        pdfUrl: result.pdfUrl, 
        provider: result.provider 
      });
    }

    return NextResponse.json({ 
        error: 'All conversion providers failed.', 
        details: result.error || 'Check Token validity.'
    }, { status: 500 });

  } catch (error: any) {
    console.error('[Word-to-PDF] Fatal Exception:', error);
    return NextResponse.json({ 
      error: 'Server-side processing error.', 
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Helper to call ConvertAPI REST endpoint using Token authentication.
 */
async function callConvertApi(token: string, buffer: Buffer, filename: string, format: 'doc' | 'docx', password?: string) {
    try {
        // IMPORTANT: Use Token= instead of Secret= as per support recommendation
        let url = `https://v2.convertapi.com/convert/${format}/to/pdf?Token=${token}`;
        if (password) {
            url += `&Password=${encodeURIComponent(password)}`;
        }
        
        const apiFormData = new FormData();
        const mimeType = format === 'docx' 
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/msword';
            
        // Wrap buffer in a File object for multipart transfer
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
            return { success: false, error: `Cloud returned non-JSON: ${text.substring(0, 100)}` };
        }

        if (response.ok && data.Files && data.Files.length > 0) {
            return { 
                success: true, 
                pdfUrl: data.Files[0].Url, 
                provider: token.startsWith("x7Pt") ? 'sandbox-token' : 'production-token' 
            };
        }

        return { 
            success: false, 
            error: data.Message || data.message || `API Status ${response.status}`,
            code: response.status
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
