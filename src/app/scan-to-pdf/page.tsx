
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScannerToPdf from '@/components/scanner-to-pdf';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Allow Camera: Give your browser permission to use the camera.",
    "Position Document: Place your document in front of the camera.",
    "Scan Page: Click the 'Scan Current Page' button. A crop tool will appear.",
    "Crop & Confirm: Adjust the crop area and click 'Add to Document'.",
    "Repeat: Scan additional pages as needed. They will be added to the document.",
    "Create & Download: Once all pages are scanned, click 'Create PDF' and then 'Download PDF'.",
];

export default function ScanToPdfPage() {
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
            <ScannerToPdf />
        </div>
        <HowToGuide title="Scan to PDF" steps={steps} />
    </main>
  );
}
