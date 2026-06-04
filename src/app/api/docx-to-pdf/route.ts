import { NextResponse } from 'next/server';
// @ts-ignore
import convertapi from 'convertapi';
// @ts-ignore
import CloudConvert from 'cloudconvert';

/**
 * @fileOverview Server-side DOCX to PDF conversion route with robust upload strategy.
 * Strategy:
 * 1. ConvertAPI Production Token (via Upload API)
 * 2. ConvertAPI Sandbox Token (Fallback via Upload API)
 * 3. CloudConvert (Optional Fallback)
 */

export async function POST(req: Request) {
  // Production and Sandbox tokens provided by the user
  const PROD_TOKEN = process.env.CONVERT_API_SECRET || "LDWZ4A1C9k1uSo7JBeoyfgSYvdyPWif7";
  const SANDBOX_TOKEN = "x7PtJTfCnxdSx5Ba5otIyDb9G4vkvMYy";
  const CLOUD_CONVERT_API_KEY = process.env.CLOUD_CONVERT_API_KEY;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let lastError = "All conversion attempts failed.";

    // --- STRATEGY 1: CONVERTAPI (PRODUCTION TOKEN) ---
    if (PROD_TOKEN) {
        try {
          console.log('Attempting Production conversion via Upload...');
          const capi = convertapi(PROD_TOKEN);
          
          // Step A: Upload the buffer to ConvertAPI cloud
          // This avoids the "path must be a string" error with generic Readable streams
          const uploadResult = await capi.upload(buffer, file.name);
          
          // Step B: Convert using the uploaded FileId
          const result = await capi.convert('pdf', { 
              File: uploadResult.fileId 
          }, 'docx');
          
          if (result.files && result.files.length > 0) {
              console.log('Production conversion successful.');
              return NextResponse.json({ 
                success: true, 
                pdfUrl: result.files[0].url, 
                provider: 'convertapi-prod' 
              });
          }
        } catch (capiError: any) {
          console.warn('Production token failed:', capiError.message);
          lastError = `Production Error: ${capiError.message}`;
          // Proceed to sandbox
        }
    }

    // --- STRATEGY 2: CONVERTAPI (SANDBOX TOKEN FALLBACK) ---
    if (SANDBOX_TOKEN) {
        try {
            console.log('Attempting Sandbox conversion via Upload...');
            const capi = convertapi(SANDBOX_TOKEN);
            
            // Re-upload using sandbox context
            const uploadResult = await capi.upload(buffer, file.name);
            
            const result = await capi.convert('pdf', { 
                File: uploadResult.fileId
            }, 'docx');
            
            if (result.files && result.files.length > 0) {
                console.log('Sandbox conversion successful.');
                return NextResponse.json({ 
                  success: true, 
                  pdfUrl: result.files[0].url, 
                  provider: 'convertapi-sandbox' 
                });
            }
        } catch (sandboxError: any) {
            console.warn('Sandbox token failed:', sandboxError.message);
            lastError = `Sandbox Error: ${sandboxError.message}`;
            // Proceed to CloudConvert if available
        }
    }

    // --- STRATEGY 3: CLOUDCONVERT (FALLBACK) ---
    if (CLOUD_CONVERT_API_KEY) {
        try {
            console.log('Attempting CloudConvert fallback...');
            const cloudConvert = new CloudConvert(CLOUD_CONVERT_API_KEY);
            
            let job = await cloudConvert.jobs.create({
              tasks: {
                'upload-task': { operation: 'import/upload' },
                'convert-task': { operation: 'convert', input: 'upload-task', output_format: 'pdf', engine: 'office' },
                'export-task': { operation: 'export/url', input: 'convert-task' }
              }
            });

            const uploadTask = job.tasks.find((task: any) => task.name === 'upload-task');
            const { Readable } = await import('stream');
            const uploadStream = Readable.from(buffer);

            await cloudConvert.tasks.upload(uploadTask, uploadStream, file.name);
            job = await cloudConvert.jobs.wait(job.id);
            
            const exportTask = job.tasks.find((task: any) => task.name === 'export-task' && task.status === 'finished');

            if (exportTask?.result?.files) {
              return NextResponse.json({ 
                success: true, 
                pdfUrl: exportTask.result.files[0].url, 
                provider: 'cloudconvert' 
              });
            }
        } catch (ccError: any) {
            console.error('CloudConvert fallback failed:', ccError.message);
            lastError = `CloudConvert Error: ${ccError.message}`;
        }
    }

    return NextResponse.json({ 
        error: 'All conversion providers failed.', 
        details: lastError 
    }, { status: 500 });

  } catch (error: any) {
    console.error('Final Fatal Conversion Failure:', error);
    return NextResponse.json({ 
      error: 'Server-side conversion failed.', 
      details: error.message 
    }, { status: 500 });
  }
}
