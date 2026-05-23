import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScannerToPdf from '@/components/scanner-to-pdf';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Scan to PDF - Turn Device Camera into Mobile Document Scanner',
  description: 'Scan physical documents using your mobile or desktop camera and save as PDF. 100% local, secure, and easy doc scanning.',
};

const steps = [
    "Camera: Allow browser permission to use camera.",
    "Position: Place document in front of camera.",
    "Capture: Scan and crop each page.",
    "Bundle: Create and download your multi-page PDF.",
];

export default function ScanToPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <ScannerToPdf />
        </div>
        <HowToGuide title="Scan to PDF" steps={steps} />
    </main>
  );
}
