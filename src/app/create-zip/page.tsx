
import { Metadata } from 'next';
import { HelpCircle, Package, Lock } from 'lucide-react';
import ZipCreator from '@/components/zip-creator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Create ZIP Archive Online - Bundle Multiple Files Free',
  description: 'Bundle and compress multiple files into a single ZIP archive instantly. Secure, fast, and works entirely in your browser memory.',
};

export default function CreateZipPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=file" label="Back to Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ZipCreator />
        </div>
        
        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Zip Creator" steps={[
                "Add Files: Select or drop multiple files to bundle.",
                "Review: Check the file list for accuracy.",
                "Create: Click 'Create Zip' to bundle them in RAM.",
                "Download: Save your new .zip archive instantly.",
            ]} />

            {/* Detailed Content */}
            <section className="space-y-10 py-10 border-t">
                <h2 className="text-3xl font-black uppercase tracking-tight text-center">Fast & Secure File Bundling</h2>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex gap-4 p-6 bg-muted/30 rounded-3xl">
                            <Package className="text-primary size-10 shrink-0" />
                            <div>
                                <h3 className="font-bold">Zero Upload Compression</h3>
                                <p className="text-sm text-muted-foreground mt-1">Our tool uses JSZip technology to compress your files directly in your browser. Your files never touch our servers, making it the safest way to bundle sensitive documents.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-muted/30 rounded-3xl">
                            <Lock className="text-teal-600 size-10 shrink-0" />
                            <div>
                                <h3 className="font-bold">Privacy Guaranteed</h3>
                                <p className="text-sm text-muted-foreground mt-1">Perfect for sharing multiple bank statements or personal photos via email while ensuring your data remains private during the archive creation process.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 prose dark:prose-invert">
                        <h3 className="text-foreground font-black uppercase">Why use ZIP archives?</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li><strong>Easy Emailing:</strong> Send 50 files as 1 attachment.</li>
                            <li><strong>Reduced Size:</strong> Save storage space on your device.</li>
                            <li><strong>Organization:</strong> Keep related documents in a single container.</li>
                            <li><strong>Compatibility:</strong> .zip files work on Windows, Mac, and Mobile.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">ZIP Creator FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">What is the maximum file size I can add?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Since bundling happens in your browser's RAM, the limit depends on your device's memory. For most modern PCs, you can easily bundle up to 500MB to 1GB of files at once.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can I add folders to the ZIP?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Currently, our browser tool allows adding multiple individual files. For full folder structure preservation, we recommend selecting all files within the folder.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Are my files stored on your website?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            No. <strong>Never.</strong> We do not have a backend storage for your files. The moment you close the tab, all traces of your files are cleared from your device's temporary memory.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
