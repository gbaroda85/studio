import PdfCropper from '@/components/pdf-cropper';

export default function CropPdfPage() {
  return (
    <main className="flex flex-1 items-start justify-center p-4 md:p-8">
      <PdfCropper />
    </main>
  );
}
