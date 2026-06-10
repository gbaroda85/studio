
import { Metadata } from 'next';
import TextToPdfConverter from '@/components/text-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Text to PDF Converter - Create Clean PDF Documents from Plain Text Online',
  description: 'Convert plain text, notes, or code into professional PDF files. Customize fonts, sizes, and margins locally in your browser for 100% privacy.',
  alternates: { canonical: '/text-to-pdf' }
};

export default function TextToPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
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
