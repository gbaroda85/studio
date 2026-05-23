
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageCompressor from '@/components/image-compressor';
import { HowToGuide } from '@/components/how-to-guide';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';

export const metadata: Metadata = {
  title: 'AI Image Compressor - Reduce JPG/PNG to 20kb, 50kb, 100kb Online',
  description: 'Pro image compression for SSC, UPSC, and IBPS forms. Reduce file size instantly without quality loss. 100% private local browser processing.',
};

export default function ImageCompressPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Image Tools
                </Link>
            </Button>
        </div>
        
        <div className="w-full flex justify-center mb-12">
            <ImageCompressor />
        </div>

        <div className="w-full max-w-4xl space-y-12">
            <HowToGuide title="Image Compressor" steps={[
                "Upload Image: Drag and drop your JPG or PNG file.",
                "Target Size: Select 'Fixed KB Size' if you need an exact size for forms.",
                "Adjust Quality: Use the slider to balance size and clarity.",
                "Download: Save your optimized image locally in RAM."
            ]} />

            <section className="grid md:grid-cols-2 gap-12 items-center py-10 border-t">
                <div className="space-y-6">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Why Use Our AI Compressor?</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Online job applications for <strong>SSC, UPSC, and IBPS</strong> often require photos under 50KB or 20KB. Standard editors make them blurry. Our local AI engine intelligently reduces the file size while keeping the facial features sharp.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2 font-bold"><CheckCircle2 className="text-green-500 size-5" /> 100% Private - Files never leave your PC</li>
                        <li className="flex items-center gap-2 font-bold"><CheckCircle2 className="text-green-500 size-5" /> Bulk support - Process multiple photos</li>
                        <li className="flex items-center gap-2 font-bold"><CheckCircle2 className="text-green-500 size-5" /> Zero Server Logs - No risk of data leak</li>
                    </ul>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                    <Image 
                        src={placeholderData.image_tools.url} 
                        alt="Image Compression Guide" 
                        fill 
                        className="object-cover"
                        data-ai-hint={placeholderData.image_tools.hint}
                    />
                </div>
            </section>
        </div>
    </main>
  );
}
