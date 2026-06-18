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
  alternates: { canonical: 'https://www.gr7imagepdf.com/lock-pdf' }
};

export default function LockPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfLocker />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 mx-auto">
            <HowToGuide title="Vault PDF Locker" steps={[
                "Upload PDF: Drag and drop your sensitive document into the locker workspace.",
                "Set Password: Enter a secure password and confirm it carefully.",
                "Encrypt: Our local engine will wrap the document in a secure AES container.",
                "Download: Save your locked PDF. It will now require a password in any PDF reader."
            ]} />

            <section className="bg-muted/30 p-10 rounded-[3rem] border-2 border-dashed relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl font-black uppercase flex items-center gap-3 tracking-tighter text-slate-800 dark:text-white">
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
                                <span className="text-[10px) font-black uppercase">Offline Engine</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* In-depth Content with Infographic Flow Design */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Privacy Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard protection tools often only lock the "UI". Our <strong>Vault Studio</strong> encrypts the internal data streams of the PDF, making it truly secure against unauthorized access.
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
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Uses the standard encryption dictionary defined in PDF spec. Compatible with professional readers.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Lock className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">ZERO CACHE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Passwords and files are processed in volatile memory. No history is stored on your device or our server.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">AADHAAR READY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Perfect for protecting e-Aadhaar cards, bank statements, and sensitive financial reports for safe sharing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
