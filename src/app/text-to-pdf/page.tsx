import { Metadata } from 'next';
import { Type, Trophy } from 'lucide-react';
import TextToPdfConverter from '@/components/text-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Text to PDF Converter - Create Clean PDF Documents from Plain Text Online',
  description: 'Convert plain text, notes, or code into professional PDF files. Customize fonts, sizes, and margins locally in your browser for 100% privacy.',
};

export default function TextToPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> WRITING STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Text to <span className="text-gradient-hero">PDF</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Convert plain text or code into professional A4 PDF documents.
                </p>
            </div>
            
            <TextToPdfConverter />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Professional Text to PDF" steps={[
                "Editor: Paste or type your content into the smart editor.",
                "Style: Select from professional fonts like Helvetica or Times New Roman.",
                "Layout: Adjust font size and page margins for the best readability.",
                "Convert: Our engine automatically handles line wrapping and page breaks.",
                "Download: Preview your document and save it locally."
            ]} />
        </div>
    </main>
  );
}
