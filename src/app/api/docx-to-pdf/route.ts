import { NextResponse } from 'next/server';
import { Readable } from 'stream';
// @ts-ignore
import convertapi from 'convertapi';
// @ts-ignore
import CloudConvert from 'cloudconvert';

/**
 * @fileOverview Server-side DOCX to PDF conversion route with multi-token fallback.
 * Strategy:
 * 1. ConvertAPI Production Token
 * 2. ConvertAPI Sandbox Token (Fallback)
 * 3. CloudConvert (Optional Fallback)
 */

export async function POST(req: Request) {
  // Use user-provided production and sandbox tokens
  const PROD_TOKEN = process.env.CONVERT_API_SECRET || "LDWZ4A1C9k1uSo7JBeoyfgSYvdyPWif7";
  const SANDBOX_TOKEN = "x7PtJTfCnxdSx5Ba5otIyDb9G4vkvMYy";
  const CLOUD_CONVERT_API_KEY = process.env.CLOUD_CONVERT_API_KEY;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- STRATEGY 1: CONVERTAPI (PRODUCTION TOKEN) ---
    if (PROD_TOKEN) {
        try {
          console.log('Attempting conversion with PRODUCTION token...');
          const capi = convertapi(PROD_TOKEN);
          
          // Use Readable.from for efficient stream handling in Next.js
          const stream = Readable.from(buffer);
          const result = await capi.convert('pdf', { File: stream }, 'docx');
          
          if (result.files && result.files.length > 0) {
              return NextResponse.json({ 
                success: true, 
                pdfUrl: result.files[0].url, 
                provider: 'convertapi-prod' 
              });
          }
        } catch (capiError: any) {
          console.warn('Production token failed:', capiError.message);
          // Proceed to sandbox fallback
        }
    }

    // --- STRATEGY 2: CONVERTAPI (SANDBOX TOKEN FALLBACK) ---
    if (SANDBOX_TOKEN) {
        try {
            console.log('Attempting conversion with SANDBOX token...');
            const capi = convertapi(SANDBOX_TOKEN);
            
            const stream = Readable.from(buffer);
            const result = await capi.convert('pdf', { File: stream }, 'docx');
            
            if (result.files && result.files.length > 0) {
                return NextResponse.json({ 
                  success: true, 
                  pdfUrl: result.files[0].url, 
                  provider: 'convertapi-sandbox' 
                });
            }
        } catch (sandboxError: any) {
            console.warn('Sandbox token also failed:', sandboxError.message);
            // Proceed to CloudConvert if available
        }
    }

    // --- STRATEGY 3: CLOUDCONVERT (EXTRA FALLBACK) ---
    if (CLOUD_CONVERT_API_KEY) {
        try {
            console.log('Attempting fallback conversion with CloudConvert...');
            const cloudConvert = new CloudConvert(CLOUD_CONVERT_API_KEY);
            
            let job = await cloudConvert.jobs.create({
              tasks: {
                'upload-task': { operation: 'import/upload' },
                'convert-task': { operation: 'convert', input: 'upload-task', output_format: 'pdf', engine: 'office' },
                'export-task': { operation: 'export/url', input: 'convert-task' }
              }
            });

            const uploadTask = job.tasks.find((task: any) => task.name === 'upload-task');
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
        }
    }

    return NextResponse.json({ 
        error: 'All conversion providers failed.', 
        details: 'Checked Production Token, Sandbox Token, and CloudConvert. All attempts returned errors.' 
    }, { status: 500 });

  } catch (error: any) {
    console.error('Final Fatal Conversion Failure:', error);
    return NextResponse.json({ 
      error: 'Server-side conversion failed.', 
      details: error.message 
    }, { status: 500 });
  }
}
