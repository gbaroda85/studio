
import { Metadata } from 'next';
import { ArrowLeft, Lock, ShieldCheck, Zap, HelpCircle, Key, FileLock2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PdfProtector from '@/components/pdf-protector';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Vault Protect PDF - Add Password & AES-128 Encryption Online Securely',
  description: 'Protect your sensitive PDF documents with strong passwords and bank-grade encryption. Features permission control and 100% private local processing.',
};

export default function ProtectPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to PDF Tools
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <PdfProtector />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="Vault PDF Protector" steps={[
                "Upload: Select the PDF document you want to secure.",
                "Password: Enter a strong password for opening the document.",
                "Confirm: Re-type the password to ensure there are no typos.",
                "Protect: Our local engine applies AES-128 encryption instantly.",
                "Download: Save your secure, password-locked PDF locally."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Key className="text-primary size-8" />
                        Bank-Grade Document Security
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Sending sensitive contracts or personal IDs over email? Our <strong>PDF Vault</strong> ensures your data is encrypted with industrial standards, preventing unauthorized access even if the file is intercepted.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Lock className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">AES-128 Lock</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses standard Advanced Encryption Standard to wrap your document in a secure digital shell.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <FileLock2 className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Permissions</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Encrypted PDFs automatically restrict copying and editing, ensuring your content stays original.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-green-500/50 transition-all">
                        <ShieldCheck className="text-green-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Offline</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">The encryption logic runs entirely on your device. We never see your password or your files.</p>
                    </div>
                </div>
            </section>

            {/* Warning Section */}
            <section className="bg-orange-500/10 p-10 rounded-[3rem] border-2 border-dashed border-orange-500/20">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="size-20 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="size-10 text-orange-600" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-orange-700">Important: Store your password!</h2>
                        <p className="text-orange-900/70 leading-relaxed text-sm font-medium">
                            Once a PDF is encrypted locally, there is no "Forgot Password" feature. If you lose your password, the data cannot be recovered even by us. Always keep a secure backup of your passwords.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Security FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is this encryption compatible with Adobe Reader?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. We use industry-standard PDF security dictionaries. Any standard PDF viewer (Adobe, Chrome, Foxit, Mobile Readers) will recognize the encryption and prompt for the password.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does protecting a file increase its size?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Encryption adds a very small amount of metadata (usually less than 5KB) to the file header. The actual document size remains practically the same.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I protect multiple files at once?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Currently, our tool processes one file at a time to ensure maximum security for each document. You can quickly protect files one after another.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
