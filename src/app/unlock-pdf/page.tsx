
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfUnlocker from '@/components/pdf-unlocker';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload PDF: Select your password-protected PDF file.",
    "Enter Password: Type the current password for the PDF.",
    "Unlock: Click the 'Unlock PDF' button to remove the encryption.",
    "Download: Click 'Download Unlocked PDF' to save the decrypted file.",
];

export default function UnlockPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PdfUnlocker />
        </div>
        <HowToGuide title="PDF Unlocker" steps={steps} />
    </main>
  );
}
