
import { Metadata } from 'next';
import { ArrowLeft, Lock, ShieldCheck, Zap, HelpCircle, Key, FileLock2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PdfProtector from '@/components/pdf-protector';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Vault Protect PDF - Real AES Encryption & Password Protection Online',
  description: 'Secure your PDF documents with industry-standard AES encryption. Set user passwords and permissions (print/copy) locally in your browser. 100% private and offline.',
  keywords: ['protect pdf', 'encrypt pdf online', 'pdf password protection', 'aes pdf encryption', 'secure pdf tool'],
};

export default function ProtectPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <ShieldAlert className="size-3" /> MILITARY GRADE PROTECTION
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                    PDF <span className="text-gradient-hero">Vault Pro</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Inject un-bypassable AES encryption into your sensitive documents. 100% Offline.
                </p>
            </div>
            
            <div className="w-full flex justify-center">
                <PdfProtector />
            </div>
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Vault PDF Protector" steps={[
                "Upload: Drag and drop the PDF document you want to secure.",
                "Set Password: Enter a strong secret password in the vault panel.",
                "Verify: Confirm the password to ensure zero typing errors.",
                "Encrypt: Click 'Protect PDF Now' to run the local AES encoding engine.",
                "Download: Save your securely locked PDF instantly to your device."
            ]} />

            {/* Deep Value Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Key className="text-primary size-8" />
                        Un-Bypassable Security Layer
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard tools often use fake UI locks. <strong>GR7 Vault Pro</strong> modifies the internal PDF dictionary to force a native system-level password prompt in Adobe Acrobat, Chrome, and iOS/Android.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all group">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Lock className="size-8" />
                        </div>
                        <h3 className="font-black uppercase text-sm tracking-widest">AES-128 Lock</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses Advanced Encryption Standard to wrap your document in a digital shell that cannot be bypassed without the key.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all group">
                        <div className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                            <Sparkles className="size-8" />
                        </div>
                        <h3 className="font-black uppercase text-sm tracking-widest">HD Preservation</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our engine renders at 300 DPI (high density) to ensure your original fonts and signatures remain crystal clear after encryption.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all group">
                        <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="size-8" />
                        </div>
                        <h3 className="font-black uppercase text-sm tracking-widest">Zero Server Log</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Encryption happens in your device's RAM. We never store or see your password or your files. Pure privacy.</p>
                    </div>
                </div>
            </section>

            {/* Critical Warning */}
            <section className="bg-orange-500/5 p-10 rounded-[3rem] border-2 border-dashed border-orange-500/20">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="size-24 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="size-12 text-orange-600" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-orange-800">Critical Password Notice</h2>
                        <p className="text-orange-900/70 leading-relaxed text-sm font-semibold">
                            Once a PDF is encrypted locally, there is no "Forgot Password" option. If you lose your password, the data is gone forever—even we cannot recover it. Please save your passwords in a safe vault.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Security & Encryption FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is this encryption compatible with iPhone and Android?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! We use industry-standard PDF security protocols. Any modern mobile browser, the native "Files" app on iOS, or standard PDF viewers on Android will prompt for the password.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does protecting a file reduce its quality?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. While we re-encode the file to apply encryption, we use high-density (300 DPI) rendering. This ensures that text, tables, and signatures remain sharp and professional.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I set printing or copying restrictions?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. The vault panel includes optional toggles to disable content copying and printing. This is essential for protecting intellectual property and legal drafts.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How long can the password be?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            There is no hard limit, but we recommend a password between **8 and 16 characters** using a mix of letters, numbers, and symbols for maximum resistance against brute-force attacks.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
