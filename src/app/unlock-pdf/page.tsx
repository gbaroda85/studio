import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, FileText, Info, Key, Unlock } from 'lucide-react';
import PdfUnlocker from '@/components/pdf-unlocker';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'PDF Unlocker - Remove Password from Aadhaar & Bank PDFs',
  description: 'Remove password protection from encrypted PDFs locally. 100% private tool for Aadhaar cards, bank statements, and credit card bills. No data leaves your device.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/unlock-pdf' }
};

export default function UnlockPdfPage() {
  const deepSteps = [
    {
      title: "Secure Import",
      description: "Select your password-protected Aadhaar or Bank statement. Our engine initializes a local sandbox in your RAM, ensuring zero data persistence on servers.",
      icon: "UploadCloud"
    },
    {
      title: "Identity Key",
      description: "Enter the current password once. For Aadhaar, it's usually the first 4 letters of your name (CAPS) + Year of Birth.",
      icon: "Key"
    },
    {
      title: "Decoding Layer",
      description: "The local engine uses high-fidelity re-encoding to strip the security dictionary while preserving 100% of the internal vector data.",
      icon: "Unlock"
    },
    {
      title: "Permanent Save",
      description: "Save the permanently unlocked PDF. It will now open without a password in any PDF reader, ready for sharing or storage.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfUnlocker />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 mx-auto pb-20">
            <HowToGuide title="PDF Unlocker Studio" steps={deepSteps} />

            <section className="bg-muted/30 p-10 rounded-[3rem] border-2 border-dashed relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl font-black uppercase flex items-center gap-3 tracking-tighter text-slate-800 dark:text-white">
                            <Key className="text-primary size-8" /> 
                            Permanent Decryption
                        </h2>
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                            Tired of entering your name and birth year every time you open your <strong>e-Aadhaar</strong>? Our tool removes the encryption permanently. Since it works locally in your browser, your sensitive financial and personal data is <strong>never uploaded to any server</strong>.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm border border-primary/10">
                                <ShieldCheck className="text-green-500 size-4" />
                                <span className="text-xs font-black uppercase">100% Secure</span>
                            </div>
                            <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm border border-primary/10">
                                <Unlock className="text-blue-500 size-4" />
                                <span className="text-xs font-black uppercase">Instant Unlock</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
