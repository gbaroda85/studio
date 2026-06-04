import { NextResponse } from 'next/server';

/**
 * @fileOverview Professional server-side Word to PDF conversion route.
 * Uses Direct REST API with Token authentication for maximum reliability.
 */

export async function POST(req: Request) {
  // Hardcoded Tokens provided by user
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

    console.log(`[Word-to-PDF] Starting Cloud Conversion for ${file.name}...`);

    // --- TRY PRODUCTION TOKEN FIRST ---
    let result = await callConvertApi(PROD_TOKEN, buffer, file.name, format, password);
    
    // --- FALLBACK TO SANDBOX TOKEN IF PROD FAILS (and it's not a password error) ---
    if (!result.success) {
      // If error is password related, stop and ask user immediately
      if (result.code === 401 || (result.error && result.error.toLowerCase().includes('password'))) {
          return NextResponse.json({ 
            error: 'File is password protected. Please supply the correct password.', 
            code: 'PASSWORD_REQUIRED' 
          }, { status: 401 });
      }
      
      console.warn(`[Word-to-PDF] Production Token Failed (${result.error}). Attempting Sandbox Fallback...`);
      result = await callConvertApi(SANDBOX_TOKEN, buffer, file.name, format, password);
    }

    if (result.success && result.pdfUrl) {
      console.log(`[Word-to-PDF] SUCCESS via ${result.provider} provider.`);
      return NextResponse.json({ 
        success: true, 
        pdfUrl: result.pdfUrl, 
        provider: result.provider 
      });
    }

    // If we reach here, it means everything failed
    console.error(`[Word-to-PDF] All providers failed. Final Error: ${result.error}`);
    return NextResponse.json({ 
        error: 'Cloud conversion failed.', 
        details: result.error || 'Token limit or network error.'
    }, { status: 500 });

  } catch (error: any) {
    console.error('[Word-to-PDF] Fatal Server Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Direct REST API call helper using standard fetch
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
            
        // Use Blob + Filename in append for maximum Node/Cloud compatibility
        const fileBlob = new Blob([buffer], { type: mimeType });
        apiFormData.append('File', fileBlob, filename);

        const response = await fetch(url, {
            method: 'POST',
            body: apiFormData,
            headers: {
                'Accept': 'application/json'
            }
        });

        const text = await response.text();
        let data: any = {};
        
        try {
            data = JSON.parse(text);
        } catch (e) {
            return { success: false, error: `Cloud returned non-JSON: ${text.substring(0, 100)}`, code: response.status };
        }

        if (response.ok && data.Files && data.Files.length > 0) {
            return { 
                success: true, 
                pdfUrl: data.Files[0].Url, 
                provider: token === "x7PtJTfCnxdSx5Ba5otIyDb9G4vkvMYy" ? 'sandbox' : 'production' 
            };
        }

        const errorMsg = data.Message || data.message || `Error ${response.status}`;
        return { 
            success: false, 
            error: errorMsg,
            code: response.status
        };
    } catch (e: any) {
        return { success: false, error: `Network Exception: ${e.message}` };
    }
}
