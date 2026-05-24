
import { Metadata } from 'next';
import Unzipper from '@/components/unzipper';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Unzip File Online - Extract ZIP Archives Safely and Privately',
  description: 'Extract contents from ZIP files instantly in your browser. No server uploads. 100% private and secure extraction tool.',
};

const steps = [
    "Upload: Drag and drop your .zip file.",
    "Process: The tool extracts contents locally in RAM.",
    "Download: Save individual files from the archive.",
];

export default function UnzipFilePage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=file" label="Back to Tools" />
        <div className="w-full flex justify-center px-4">
            <Unzipper />
        </div>
        <div className="w-full max-w-4xl px-4 mx-auto">
            <HowToGuide title="Unzipper Tool" steps={steps} />
        </div>
    </main>
  );
}
