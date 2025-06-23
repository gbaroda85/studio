
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfCompressor from '@/components/pdf-compressor';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload PDF: Drag and drop your PDF or click to select the file you want to compress.",
    "Start Compression: Click the 'Compress PDF' button to begin the process.",
    "Review Results: The tool will show you the compression savings.",
    "Download: Click 'Download Compressed PDF' to get your smaller file.",
];


export default function CompressPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PdfCompressor />
        </div>
        <HowToGuide title="PDF Compressor" steps={steps} />
    </main>
  );
}
