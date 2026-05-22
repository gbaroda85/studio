
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfProtector from '@/components/pdf-protector';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Vault Protect PDF - Add Password & AES Encryption Online',
  description: 'Secure your PDF files with strong passwords and AES encryption. 100% private, files never leave your device. Adobe compatible.',
};

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
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=pdf">
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
