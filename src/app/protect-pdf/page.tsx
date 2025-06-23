
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfProtector from '@/components/pdf-protector';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload PDF: Select the PDF file you want to secure.",
    "Set Password: Enter a strong password in the input field.",
    "Protect: Click the 'Protect PDF' button to encrypt the file.",
    "Download: Click 'Download Protected PDF' to save your new password-protected file.",
];

export default function ProtectPdfPage() {
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
            <PdfProtector />
        </div>
        <HowToGuide title="PDF Protector" steps={steps} />
    </main>
  );
}
