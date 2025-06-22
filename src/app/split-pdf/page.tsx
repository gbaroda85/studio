import PdfSplitter from '@/components/pdf-splitter';

export default function SplitPdfPage() {
  return (
    <main className="flex flex-1 items-start justify-center p-4 md:p-8">
      <PdfSplitter />
    </main>
  );
}
