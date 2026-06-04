import { NextResponse } from 'next/server';

/**
 * @fileOverview Professional server-side Word to PDF conversion route.
 * Optimized for both .doc and .docx using direct REST API calls.
 * captures detailed cloud errors for debugging.
 */

export async function POST(req: Request) {
  // Hardcoded fallback tokens provided by the user for maximum reliability
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
    const fileName = file.name.toLowerCase();
    
    // Detect correct ConvertAPI endpoint based on file extension
    const format = fileName.endsWith('.docx') ? 'docx' : 'doc';

    console.log(`[Word-to-PDF] Starting ${format.toUpperCase()} conversion for:`, file.name);

    // --- STRATEGY 1: CONVERTAPI (PRODUCTION) ---
    let result = await callConvertApi(PROD_TOKEN, buffer, file.name, format, password);
    
    // --- STRATEGY 2: CONVERTAPI (SANDBOX FALLBACK) ---
    if (!result.success) {
      // If error is specifically about password, stop and ask user for password
      if (result.error && (result.error.toLowerCase().includes('password') || result.code === 401)) {
          return NextResponse.json({ 
            error: 'File is password protected. Please supply the correct password.', 
            code: 'PASSWORD_REQUIRED' 
          }, { status: 401 });
      }
      
      console.warn(`[Word-to-PDF] Production API failed: ${result.error}. Trying Sandbox fallback...`);
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

    // Final failure response with the actual error message from the cloud engine
    console.error(`[Word-to-PDF] All attempts failed. Last error: ${result.error}`);
    return NextResponse.json({ 
        error: 'Conversion failed.', 
        details: result.error || 'Unknown cloud error'
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
 * Helper to call ConvertAPI REST endpoint directly using native fetch.
 * Uses File object for better multipart compatibility.
 */
async function callConvertApi(token: string, buffer: Buffer, filename: string, format: 'doc' | 'docx', password?: string) {
    try {
        let url = `https://v2.convertapi.com/convert/${format}/to/pdf?Secret=${token}`;
        if (password) {
            url += `&Password=${encodeURIComponent(password)}`;
        }
        
        const apiFormData = new FormData();
        const mimeType = format === 'docx' 
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/msword';
            
        // Using File instead of Blob for better cloud filename detection
        const fileObj = new File([buffer], filename, { type: mimeType });
        apiFormData.append('File', fileObj);

        const response = await fetch(url, {
            method: 'POST',
            body: apiFormData,
        });

        const text = await response.text();
        let data: any = {};
        
        try {
            data = JSON.parse(text);
        } catch (e) {
            // Handle non-JSON errors (like cloud outages)
            return { success: false, error: `Cloud returned status ${response.status}: ${text.substring(0, 100)}` };
        }

        if (response.ok && data.Files && data.Files.length > 0) {
            return { 
                success: true, 
                pdfUrl: data.Files[0].Url, 
                provider: token.startsWith("x7Pt") ? 'convertapi-sandbox' : 'convertapi-prod' 
            };
        }

        // Return the actual error message from ConvertAPI
        const cloudError = data.Message || data.message || `API returned status ${response.status}`;
        return { 
            success: false, 
            error: cloudError,
            code: response.status
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
