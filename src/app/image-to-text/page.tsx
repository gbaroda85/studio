
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, SearchCode, Languages, Clipboard } from 'lucide-react';
import ImageToTextConverter from '@/components/image-to-text-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Image to Text (OCR) - Extract Text from Photos Online Securely',
  description: 'Smart local OCR tool to extract text from documents, screenshots, and notes. Supports English and Hindi with 100% privacy.',
};

export default function ImageToTextPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ImageToTextConverter />
        </div>
        
        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Smart Image to Text (OCR)" steps={[
                "Upload Image: Select an image containing text (like a screenshot or a scanned document).",
                "Extract Text: Click the 'Extract Text' button to start the professional OCR process.",
                "Review & Copy: The extracted text will appear in the textbox. You can edit it or copy it to your clipboard.",
                "Convert Another: Click 'Start Over' to process a new image.",
            ]} />

            {/* Content Section */}
            <section className="space-y-10 py-10 border-t">
                <h2 className="text-3xl font-black uppercase tracking-tight text-center">Professional Local OCR Engine</h2>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                <SearchCode className="text-primary" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm">Character Recognition</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-1">Our tool uses Tesseract.js, a port of the famous Tesseract OCR engine, optimized to run directly in your browser. It recognizes characters by analyzing pixel patterns instantly.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="size-12 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
                                <Languages className="text-teal-600" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm">Multi-Language Support</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-1">Unlike basic tools, we support a combined dataset for <strong>English and Hindi</strong>. This is perfect for Indian users scanning bilingual government documents or office notes.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div className="flex gap-4">
                            <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Clipboard className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm">One-Click Export</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-1">Once extracted, you can immediately copy the text or edit it directly. No more manual typing from screenshots or blurry PDFs.</p>
                            </div>
                        </div>
                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 italic text-sm text-primary">
                            "Perfect for students, lawyers, and office workers who need to digitize physical text without compromising data security."
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">OCR Frequently Asked Questions</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">How accurate is the text extraction?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Accuracy depends heavily on image quality. Our tool includes an <strong>Auto-Clean Logic</strong> that boosts contrast before scanning to improve accuracy up to 98% for clear documents.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can it read handwritten notes?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            It can read neat handwriting, but it works best with printed text from books, newspapers, or digital screenshots.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Why is local OCR better than online OCR?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Online OCR services store your images on their servers. Local OCR keeps your images on <strong>your device</strong>, making it the only safe choice for sensitive documents like ID cards or legal contracts.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
