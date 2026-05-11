import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignatureRemover from '@/components/signature-remover';
import { HowToGuide } from '@/components/how-to-guide';

export const dynamic = 'force-dynamic';

const steps = [
  "Upload Document: Select an image of a document or photo that has a signature.",
  "Start Removal: Click the 'Remove Signature' button to let AI process the image.",
  "Review: See the original and the cleaned version side-by-side.",
  "Download: Click 'Download Image' to save your document without the signature.",
];

export default function RemoveSignaturePage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <SignatureRemover />
        </div>
        <HowToGuide title="AI Signature Remover" steps={steps} />
    </main>
  );
}
