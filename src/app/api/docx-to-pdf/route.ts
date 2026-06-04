import { NextResponse } from 'next/server';

/**
 * @fileOverview Professional server-side Word to PDF conversion route.
 * Optimized for both .doc and .docx using direct REST API calls.
 */

export async function POST(req: Request) {
  // Use tokens provided by the user
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

    console.log(`[CloudConvert] Starting ${format.toUpperCase()} conversion for:`, file.name);

    // --- STRATEGY 1: CONVERTAPI (PRODUCTION) ---
    let result = await callConvertApi(PROD_TOKEN, buffer, file.name, format, password);
    
    // --- STRATEGY 2: CONVERTAPI (SANDBOX FALLBACK) ---
    if (!result.success) {
      // If error is specifically about password, stop and ask user for password
      if (result.error && result.error.toLowerCase().includes('password')) {
          return NextResponse.json({ error: result.error, code: 'PASSWORD_REQUIRED' }, { status: 401 });
      }
      
      console.warn(`Production API failed (${result.error}), trying Sandbox fallback...`);
      result = await callConvertApi(SANDBOX_TOKEN, buffer, file.name, format, password);
    }

    if (result.success && result.pdfUrl) {
      return NextResponse.json({ 
        success: true, 
        pdfUrl: result.pdfUrl, 
        provider: result.provider 
      });
    }

    // Final failure response with the actual error message from the cloud engine
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
 * Helper to call ConvertAPI REST endpoint directly using native fetch.
 * This avoids filesystem path issues in serverless environments.
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
            
        // We wrap the buffer in a Blob for native fetch FormData compatibility
        const fileBlob = new Blob([buffer], { type: mimeType });
        apiFormData.append('File', fileBlob, filename);

        const response = await fetch(url, {
            method: 'POST',
            body: apiFormData,
        });

        const data = await response.json();

        if (response.ok && data.Files && data.Files.length > 0) {
            return { 
                success: true, 
                pdfUrl: data.Files[0].Url, 
                provider: token === "x7PtJTfCnxdSx5Ba5otIyDb9G4vkvMYy" ? 'convertapi-sandbox' : 'convertapi-prod' 
            };
        }

        // Return the actual error message from ConvertAPI
        const cloudError = data.Message || data.message || `API returned status ${response.status}`;
        return { 
            success: false, 
            error: cloudError
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
