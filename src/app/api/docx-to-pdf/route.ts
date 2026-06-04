import { NextResponse } from 'next/server';
import { Readable } from 'stream';
// @ts-ignore
import convertapi from 'convertapi';
// @ts-ignore
import CloudConvert from 'cloudconvert';

/**
 * @fileOverview Server-side DOCX to PDF conversion route with multi-provider fallback.
 * Security Note: API keys are loaded from environment variables (process.env).
 * If keys are missing, the route returns a descriptive error.
 */

export async function POST(req: Request) {
  const CONVERT_API_SECRET = process.env.CONVERT_API_SECRET;
  const CLOUD_CONVERT_API_KEY = process.env.CLOUD_CONVERT_API_KEY;

  try {
    // 1. Check for keys
    if (!CONVERT_API_SECRET && !CLOUD_CONVERT_API_KEY) {
      console.error('CRITICAL: All PDF API keys are missing from Environment Variables.');
      return NextResponse.json({ 
        error: 'Server configuration error: API keys are missing. Please add CONVERT_API_SECRET and CLOUD_CONVERT_API_KEY to your .env file or Dashboard.',
        details: 'Keys are undefined.'
      }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- STRATEGY 1: CONVERTAPI (PRIMARY) ---
    if (CONVERT_API_SECRET) {
        try {
          console.log('Attempting conversion with ConvertAPI...');
          const capi = convertapi(CONVERT_API_SECRET);
          const stream = new Readable();
          stream.push(buffer);
          stream.push(null);

          const uploadResult = await capi.upload(stream, file.name);
          const result = await capi.convert('pdf', { File: uploadResult }, 'docx');
          const pdfUrl = result.files[0].url;

          return NextResponse.json({ 
            success: true, 
            pdfUrl, 
            provider: 'convertapi' 
          });
        } catch (capiError: any) {
          console.warn('ConvertAPI failed or limit reached:', capiError.message);
          // If strategy 1 fails, we proceed to strategy 2
        }
    }

    // --- STRATEGY 2: CLOUDCONVERT (FALLBACK) ---
    if (CLOUD_CONVERT_API_KEY) {
        try {
            console.log('Attempting fallback conversion with CloudConvert...');
            const cloudConvert = new CloudConvert(CLOUD_CONVERT_API_KEY);
            
            let job = await cloudConvert.jobs.create({
              tasks: {
                'upload-task': {
                  operation: 'import/upload'
                },
                'convert-task': {
                  operation: 'convert',
                  input: 'upload-task',
                  output_format: 'pdf',
                  engine: 'office' 
                },
                'export-task': {
                  operation: 'export/url',
                  input: 'convert-task'
                }
              }
            });

            const uploadTask = job.tasks.find((task: any) => task.name === 'upload-task');
            const uploadStream = new Readable();
            uploadStream.push(buffer);
            uploadStream.push(null);

            await cloudConvert.tasks.upload(uploadTask, uploadStream, file.name);
            job = await cloudConvert.jobs.wait(job.id);
            
            const exportTask = job.tasks.find(
              (task: any) => task.name === 'export-task' && task.status === 'finished'
            );

            if (!exportTask || !exportTask.result || !exportTask.result.files) {
              throw new Error('CloudConvert failed to generate output URL.');
            }

            const pdfUrl = exportTask.result.files[0].url;

            return NextResponse.json({ 
              success: true, 
              pdfUrl, 
              provider: 'cloudconvert' 
            });
        } catch (ccError: any) {
            console.error('CloudConvert fallback also failed:', ccError.message);
            throw ccError;
        }
    }

    return NextResponse.json({ error: 'All conversion providers failed or were not configured.' }, { status: 500 });

  } catch (error: any) {
    console.error('Final Conversion Failure:', error);
    return NextResponse.json({ 
      error: 'Cloud conversion failed. Check your API limits and document format.', 
      details: error.message 
    }, { status: 500 });
  }
}
