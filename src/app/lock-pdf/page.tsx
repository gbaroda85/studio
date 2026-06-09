import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Lock, Key, FileDigit, Globe } from 'lucide-react';
import PdfLocker from '@/components/pdf-locker';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'PDF Locker - Password Protect PDF Online with AES Encryption',
  description: 'Seal your PDF documents with professional AES-128 encryption. No server uploads - 100% private local protection for bank statements, IDs, and legal docs.',
};

export default function LockPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfLocker />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 mx-auto">
            <HowToGuide title="Vault PDF Locker" steps={[
                "Upload PDF: Drag and drop your sensitive document into the locker workspace.",
                "Set Password: Enter a secure password and confirm it carefully.",
                "Encrypt: Our local engine will wrap the document in a secure AES container.",
                "Download: Save your locked PDF. It will now require a password in any PDF reader."
            ]} />

            <section className="bg-muted/30 p-10 rounded-[3rem] border-2 border-dashed relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl font-black uppercase flex items-center gap-3 tracking-tighter">
                            <Key className="text-primary size-8" /> 
                            Bank-Grade Security
                        </h2>
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                            Stop sending unprotected ID cards over WhatsApp or Email. Our <strong>Vault Locker</strong> uses standard PDF encryption protocols that are 100% compatible with <strong>Adobe Acrobat, Chrome, and iOS/Android</strong> viewers.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm border border-primary/10">
                                <ShieldCheck className="text-green-500 size-4" />
                                <span className="text-[10px] font-black uppercase">AES Standard</span>
                            </div>
                            <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm border border-primary/10">
                                <Globe className="text-blue-500 size-4" />
                                <span className="text-[10px] font-black uppercase">Offline Engine</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* In-depth Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Lock className="text-primary size-8" />
                        Professional Privacy Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard protection tools often only lock the "UI". Our <strong>Vault Studio</strong> encrypts the internal data streams of the PDF, making it truly secure against unauthorized access.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <FileDigit className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">AES-128 Support</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses the standard encryption dictionary defined in PDF spec. Compatible with professional readers.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Lock className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Zero Cache</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Passwords and files are processed in volatile memory. No history is stored on your device or our server.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Aadhaar Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Perfect for protecting e-Aadhaar cards, bank statements, and sensitive financial reports for safe sharing.</p>
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
                        <AccordionTrigger className="text-lg font-bold text-left">Is this encryption really secure?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. We use the **PDF Standard Encryption** algorithm. Unlike "fake" tools that just hide the file, our tool encrypts the internal components. This means the file cannot be previewed or indexed by search engines or bots without the correct password.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will my password be saved on your server?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            **Never.** At GR7 Tools, privacy is our architecture. The encryption happens 100% inside your browser's temporary memory (RAM). Your password never even travels over the internet.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I remove the password later?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes, but you will need our **"Unlock PDF"** tool and the original password. If you lose the password, the document is permanently sealed to protect your data.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
