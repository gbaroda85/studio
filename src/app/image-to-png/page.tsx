import ImageConverter from '@/components/image-converter';

export default function ImageToPngPage() {
  return (
    <main className="flex flex-1 items-start justify-center p-4 md:p-8">
      <ImageConverter targetFormat="png" />
    </main>
  );
}
