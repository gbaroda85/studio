
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfUnlocker from '@/components/pdf-unlocker';
import { HowToGuide } from '@/components/how-to-guide';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';

export const metadata: Metadata = {
  title: 'Universal PDF Unlocker - Remove Password from Aadhaar & Bank PDFs',
  description: 'Remove password protection from encrypted PDFs locally. 100% private tool for Aadhaar cards, bank statements, and credit card bills. No data leaves your device.',
};

export default function UnlockPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all">
                <Link href="/tools?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to PDF Tools
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <PdfUnlocker />
        </div>

        <div className="w-full max-w-4xl space-y-12">
            <HowToGuide title="PDF Unlocker" steps={[
                "Upload PDF: Select your password-protected Aadhaar or Bank statement.",
                "Enter Password: Type the correct current password once.",
                "Unlock: Our local engine will decode the security layers.",
                "Download: Save the permanently unlocked PDF for future use."
            ]} />

            <section className="bg-muted/30 p-8 rounded-[2rem] border-2 border-dashed">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                            <Lock className="text-primary" /> Permanent Decryption
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Tired of entering your name and birth year every time you open your <strong>e-Aadhaar</strong>? Our tool removes the encryption permanently. Since it works locally in your browser, your sensitive financial and personal data is <strong>never uploaded to any server</strong>.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center bg-background p-4 rounded-xl shadow-sm border border-primary/10">
                                <ShieldCheck className="text-green-500 mb-1" />
                                <span className="text-[10px] font-black">100% PRIVATE</span>
                            </div>
                            <div className="flex flex-col items-center bg-background p-4 rounded-xl shadow-sm border border-primary/10">
                                <Zap className="text-yellow-500 mb-1" />
                                <span className="text-[10px] font-black">INSTANT</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-64 h-48 relative rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                        <Image 
                            src={placeholderData.pdf_tools.url} 
                            alt="PDF Security Guide" 
                            fill 
                            className="object-cover"
                            data-ai-hint={placeholderData.pdf_tools.hint}
                        />
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
