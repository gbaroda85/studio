
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, Zap, HelpCircle, FileText, Info, Key, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfUnlocker from '@/components/pdf-unlocker';
import { HowToGuide } from '@/components/how-to-guide';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="PDF Unlocker" steps={[
                "Upload PDF: Select your password-protected Aadhaar or Bank statement.",
                "Enter Password: Type the correct current password once.",
                "Unlock: Our local engine will decode the security layers.",
                "Download: Save the permanently unlocked PDF for future use."
            ]} />

            <section className="bg-muted/30 p-10 rounded-[3rem] border-2 border-dashed relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl font-black uppercase flex items-center gap-3 tracking-tighter">
                            <Key className="text-primary size-8" /> 
                            Permanent Decryption
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
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
                    <div className="w-full md:w-80 h-56 relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
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

            {/* In-depth Content Section */}
            <section className="space-y-8 py-10 border-t">
                <h2 className="text-3xl font-black uppercase tracking-tight text-center">Why Decrypt Your Documents Locally?</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-8 bg-card rounded-3xl border shadow-sm space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2"><Info className="text-primary" /> Privacy Risk on Clouds</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Most online PDF unlockers upload your files to their servers. This is dangerous for bank statements and Aadhaar cards which contain your address, DOB, and account numbers. Our tool keeps everything on your device.</p>
                    </div>
                    <div className="p-8 bg-card rounded-3xl border shadow-sm space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="text-primary" /> How it Works</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">We use a powerful HD re-encoding engine. It renders each page of your locked PDF into a high-resolution lossless container and bundles it back into a standard PDF without any password protection.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">PDF Unlocker FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">What is the Aadhaar PDF password format?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            The standard e-Aadhaar password is the <strong>first 4 letters of your name in CAPS</strong> followed by your <strong>Year of Birth</strong>. For example, if your name is ANISH and your birth year is 1990, the password is ANIS1990.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can this tool crack a password I don't know?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            No. This tool is designed to <strong>remove</strong> a password from a document where you already know the password. It is used for convenience so you don't have to type it every time.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Will the quality of my PDF decrease?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Our "Power Unlock" mode uses high-definition re-encoding. While it's very high quality, there might be a microscopic difference in text selection. However, for printing and viewing, it remains 100% clear.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
