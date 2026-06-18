import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Scan, Grid3X3, Maximize, Sparkles } from 'lucide-react';
import ImageCropper from '@/components/image-cropper';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Smart Image Cropper - Crop, Rotate & Fix Perspective Online (HD)',
  description: 'Professional image cropping tool with Scanner Mode. Fix tilted documents, crop photos for SSC/UPSC, and extract area with 100% quality preservation.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/crop-image' }
};

export default function CropImagePage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Image Cropper Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Precision cropping with 8-dot smart scanner. 100% Private local mapping.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ImageCropper />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-24">
            <HowToGuide title="Smart Image Cropper" steps={[
                "Upload Photo: Select any photo or document from your device.",
                "Choose Mode: Use 'Rect' for standard crop or 'Scanner' for tilted photos.",
                "Adjust Handles: Drag the dots to the corners or edges you want to keep.",
                "Rotate & Flip: Use the sidebar tools to straighten or mirror the image.",
                "Export: Save your result as a high-quality JPEG, PNG, or WEBP."
            ]} />

            {/* Value Proposition Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Precision Visual Alignment Studio</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Standard cropping tools only allow you to cut rectangles. Our <strong>Smart Image Cropper</strong> features a built-in <strong>Perspective Engine</strong> that allows you to fix tilted documents, scanned receipts, and ID cards in seconds.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Scan className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">Scanner Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Perfect for mobile users. Snap a photo of a document at an angle and our AI will flatten it to a clean top-down view.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Grid3X3 className="text-emerald-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Rule of Thirds</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Built-in grid helps you align your subjects perfectly for professional photography and social media posts.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-rose-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Local Security</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your sensitive documents never leave your device. All cropping math happens in your browser RAM.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
