
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfEditor from '@/components/pdf-editor';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload PDF: Choose the PDF file you wish to edit.",
    "Navigate Page: Use the pagination controls to select the page you want to add text to.",
    "Enter Text: Type your desired text in the 'Text to Add' field.",
    "Set Position: Choose where you want the text to appear on the page from the dropdown menu.",
    "Apply & Download: Click 'Apply Text', then 'Download PDF' to save your edited file.",
];

export default function EditPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline">
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
