
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
// @ts-ignore
import convertapi from 'convertapi';
// @ts-ignore
import CloudConvert from 'cloudconvert';

/**
 * @fileOverview Server-side DOCX to PDF conversion route with multi-provider fallback.
 * Security Note: API keys are loaded from environment variables (process.env).
 */

const CONVERT_API_SECRET = process.env.CONVERT_API_SECRET;
const CLOUD_CONVERT_API_KEY = process.env.CLOUD_CONVERT_API_KEY;

export async function POST(req: Request) {
  try {
    // 1. Check for keys
    if (!CONVERT_API_SECRET || !CLOUD_CONVERT_API_KEY) {
      console.error('Missing API keys in environment variables.');
      return NextResponse.json({ 
        error: 'Server configuration error: Missing API keys.' 
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
      console.warn('ConvertAPI failed or limit reached. Switching to Fallback...', capiError.message);
      
      // --- STRATEGY 2: CLOUDCONVERT (FALLBACK) ---
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
    }
  } catch (error: any) {
    console.error('Final Conversion Failure:', error);
    return NextResponse.json({ 
      error: 'All conversion providers failed', 
      details: error.message 
    }, { status: 500 });
  }
}
