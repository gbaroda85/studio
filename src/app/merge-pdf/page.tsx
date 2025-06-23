
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfMerger from '@/components/pdf-merger';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload PDFs: Drag and drop two or more PDF files, or click to select them.",
    "Add More (Optional): You can add more files to the list. The merge order is based on the list order.",
    "Merge: Click the 'Merge PDFs' button to combine all the files.",
    "Download: Click 'Download Merged PDF' to save your single, combined document.",
];

export default function MergePdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20">
                <Link href="/?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PdfMerger />
        </div>
        <HowToGuide title="PDF Merger" steps={steps} />
    </main>
  );
}
