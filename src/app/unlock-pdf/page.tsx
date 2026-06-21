import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, FileText, Info, Key, Unlock, FileDigit, Lock, Zap } from 'lucide-react';
import PdfUnlocker from '@/components/pdf-unlocker';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
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
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        PDF Unlocker Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Remove password protection from encrypted PDFs locally. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PdfUnlocker />
            </div>
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 mx-auto pb-20">
            <HowToGuide title="PDF Unlocker Studio" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Privacy Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Standard protection tools often only lock the "UI". Our <strong>Vault Studio</strong> decrypts the internal data streams of the PDF, making it truly secure for permanent usage.
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0">
                        <svg className="w-full h-24 absolute -top-12" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d="M 300 50 C 400 50, 400 20, 500 50 S 600 80, 700 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-muted-foreground/20" />
                            <circle cx="330" cy="50" r="4" className="fill-cyan-500" />
                            <circle cx="660" cy="50" r="4" className="fill-indigo-500" />
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <FileDigit className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">AES-128 SUPPORT</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Uses standard decryption dictionaries defined in PDF specifications. Compatible with all professional readers.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Lock className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">ZERO CACHE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Passwords and files are processed in volatile memory. No history is ever stored on your device or our server.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% PRIVATE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Perfect for protecting e-Aadhaar cards, bank statements, and sensitive financial reports for safe sharing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Unlocking FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe to unlock my Aadhaar card here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. **GR7 Tools** is a client-side utility. Your Aadhaar PDF and the password you enter are processed entirely within your device's RAM. We never see your data, and nothing is uploaded to a server.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will the file size change after removing the password?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            No. Our tool uses **Direct Stream Unlocking** which only removes the security dictionary from the PDF metadata while keeping the internal page objects and images at their original quality and size.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Can I unlock bank statements and credit card bills?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Yes! Our engine supports standard **AES-128** and **AES-256** encryption used by most banks. Simply enter the password provided by your bank to permanently remove protection for easy filing.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
