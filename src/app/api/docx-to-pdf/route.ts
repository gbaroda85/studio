
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
// @ts-ignore - convertapi lacks proper TS types in some versions
import convertapi from 'convertapi';

// Aapki Secret API Key
const api = convertapi('LDWZ4A1C9k1uSo7JBeoyfgSYvdyPWif7');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // File ko memory Buffer mein convert kar rahe hain
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Node.js Stream create karna ConvertAPI upload ke liye
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // ConvertAPI par file upload
    const uploadResult = await api.upload(stream, file.name);

    // File ko DOCX se PDF mein convert karna
    const result = await api.convert('pdf', { File: uploadResult }, 'docx');

    // Generated PDF ka URL
    const pdfUrl = result.files[0].url;

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error: any) {
    console.error('ConvertAPI Error:', error);
    return NextResponse.json({ error: 'Conversion failed', details: error.message }, { status: 500 });
  }
}
