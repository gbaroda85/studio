
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Scan, Grid3X3, Maximize } from 'lucide-react';
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
};

export default function CropImagePage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ImageCropper />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
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

            {/* Educational Section */}
            <section className="bg-primary/5 p-10 rounded-[3rem] border-2 border-dashed border-primary/20">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Maximize className="size-10 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Why Use Perspective Cropping?</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you take a photo of a book page or a certificate, it often looks "crooked." A standard crop can't fix this. By using our <strong>Scanner Mode</strong>, you can drag 4 corner dots to the physical corners of the paper. Our engine then uses a mathematical homography matrix to "flatten" the image, making it look like a professional flatbed scan.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Cropping & Scanner FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about our local editing tech.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does cropping reduce my image quality?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. Unlike social media apps that compress photos, our tool performs <strong>lossless coordinate mapping</strong>. We render the final crop using the original resolution of your file, ensuring maximum clarity for printing.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the difference between "Rect" and "Scanner" mode?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            <strong>Rect mode</strong> is for standard 4-sided cropping (cutting the edges). <strong>Scanner mode</strong> is for fixing perspective; it allows you to drag all 4 corners independently to fix tilted or angled photos of documents.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I crop photos for SSC or UPSC applications?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Use the aspect ratio presets to select 1:1 or 4:3. For exact pixel sizing (like 200x230px), we recommend using our <strong>"Smart Resize"</strong> tool after you finish cropping here.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to upload my Aadhaar card or PAN card here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. We use <strong>Client-Side Processing</strong>. This means your images are processed entirely inside your browser's temporary memory (RAM) and are <strong>never uploaded</strong> to any server. Your data stays on your device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
