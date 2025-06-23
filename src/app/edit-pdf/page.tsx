
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfEditor from '@/components/pdf-editor';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload PDF: Choose the PDF file you wish to edit.",
    "Choose Tool: Select the 'Add Text' or 'Add Image' tab.",
    "Customize Content: For text, enter your text and adjust font, size, color, and position. For images, upload an image and set its position and size.",
    "Apply Changes: Click the 'Apply Text' or 'Apply Image' button.",
    "Download PDF: Once processed, click 'Download PDF' to save your edited file.",
];

export default function EditPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PdfEditor />
        </div>
        <HowToGuide title="PDF Editor" steps={steps} />
    </main>
  );
}
