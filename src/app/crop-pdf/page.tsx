import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfCropper from '@/components/pdf-cropper';

export default function CropPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline">
                <Link href="/?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PdfCropper />
        </div>
    </main>
  );
}
