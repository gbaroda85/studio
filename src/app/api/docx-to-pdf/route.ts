
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
// @ts-ignore
import convertapi from 'convertapi';
// @ts-ignore
import CloudConvert from 'cloudconvert';

/**
 * @fileOverview Server-side DOCX to PDF conversion route with fallback mechanism.
 * 1. Tries ConvertAPI (Primary).
 * 2. If limit reached or error occurs, falls back to CloudConvert.
 */

// --- API KEYS ---
const CONVERT_API_SECRET = 'LDWZ4A1C9k1uSo7JBeoyfgSYvdyPWif7';
const CLOUD_CONVERT_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNTkyMmIzZGNkZWJkMDRlOTMyOTMxOTc4ZWYwZjZlMDZmOWNjMjMwNjQyZWJkY2E2ZmEzM2NjOWU5ZjVhZjhmMWUwYWE0YjUzNjE2N2ExMTEiLCJpYXQiOjE3Nzk3ODg0MzMuNDM2OTc0LCJuYmYiOjE3Nzk3ODg0MzMuNDM2OTc2LCJleHAiOjQ5MzU0NjIwMzMuNDMxNTY1LCJzdWIiOiI3NTcxNjYxMiIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.qCUtk8UaTWg5aF1pu5wbmGCBEo_Z2rPOOkKghqWGvaJNV4UOzteo-Pb3fOkghJ8sWsaEj3IX-fGZqlRUZV6g5ur7RkhKjPKVgS9r7HSrA-IfJzVVgtSdC_EE3DjXakK78APgaPmmbJGNKlzU4pauTtsGVUt9CYPWdWLw6j7txdLYDb9FDmNZ6RNnyNY3_FIIXEF4p5RZN2RwZ7uz0xyUyEKEwcAZyJ3bSJHfonK93Bzzxetc1pxe7IZruAcLuhHOl6twM7RNlSsZNuzBoqGju5FTPHib1CShvWs-JwNBdb0rH85aBqTp2rlgRCW_mrwRlxs-HvsPNSXYGHEOO6thmsLdM9yDcMap1sd16jRA_h21FX48sRishocEPQP0JqqUjHSmp35cccGMzg8xy9EXocc8P06l0N4OcxZNfFQc60oxo0Dp0WGbVJjHpGcU_g8mTICso7ctjFmkZ7O1IWW7GzkrsBe5f6Z1Q61ANHJLV0HzQYModE_PwAiXFe2fQcxE2ahAUdFevH5vcTg8rEvxzvjvwWGMnioCR2eo6impKe-8pXjuG2UqY6a40rskw98PIdqzwVM2_aod1qT8QnW7OgQH596VVQpd_V6lLu1CfOfC36rshnbwhgvUjhKunI8CuHw6d3fQQW26uFcFg1stSDeVYz8g-y6NFdrZLoFtTy4'; 

const capi = convertapi(CONVERT_API_SECRET);

export async function POST(req: Request) {
  try {
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
      console.warn('ConvertAPI failed or limit reached. Switching to CloudConvert...', capiError.message);
      
      // Check if CloudConvert key is provided
      if (!CLOUD_CONVERT_API_KEY) {
        throw new Error('ConvertAPI failed and CloudConvert fallback is not configured.');
      }

      // --- STRATEGY 2: CLOUDCONVERT (FALLBACK) ---
      console.log('Attempting fallback conversion with CloudConvert...');
      const cloudConvert = new CloudConvert(CLOUD_CONVERT_API_KEY);
      
      // Create a job for CloudConvert
      let job = await cloudConvert.jobs.create({
        tasks: {
          'upload-task': {
            operation: 'import/upload'
          },
          'convert-task': {
            operation: 'convert',
            input: 'upload-task',
            output_format: 'pdf',
            engine: 'office' // Ensures high fidelity for DOCX
          },
          'export-task': {
            operation: 'export/url',
            input: 'convert-task'
          }
        }
      });

      const uploadTask = job.tasks.find((task: any) => task.name === 'upload-task');
      
      // Use stream for upload
      const uploadStream = new Readable();
      uploadStream.push(buffer);
      uploadStream.push(null);

      await cloudConvert.tasks.upload(uploadTask, uploadStream, file.name);
      
      // Wait for the job to finish processing
      job = await cloudConvert.jobs.wait(job.id);
      
      const exportTask = job.tasks.find(
        (task: any) => task.name === 'export-task' && task.status === 'finished'
      );

      if (!exportTask || !exportTask.result || !exportTask.result.files) {
        throw new Error('CloudConvert failed to generate export URL.');
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
