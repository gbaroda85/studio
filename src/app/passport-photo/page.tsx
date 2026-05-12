
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PassportPhotoMaker from '@/components/passport-photo-maker';
import { HowToGuide } from '@/components/how-to-guide';

export default function PassportPhotoPage() {
  const steps = [
    "Upload Photo: Select a clear photo of your face.",
    "Select Size: Choose a country preset (like India 3.5x4.5cm).",
    "AI Background: Click 'AI REMOVE' to clear the background locally.",
    "Change Clothes: Select from professional suits or shirts (Always visible).",
    "Manual Fix: If AI cuts any part, use the 'Refine' brush to restore it.",
    "Download: Save your high-quality passport photo."
  ];

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PassportPhotoMaker />
        </div>
        <HowToGuide title="Professional Passport Maker" steps={steps} />
    </main>
  );
}
