import ImageCompressor from "@/components/image-compressor";
import { Shrink } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background font-body text-foreground antialiased">
      <header className="p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3">
          <Shrink className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            ShrinkRay
          </h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <ImageCompressor />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        <p>
          Built with Next.js and shad/cn. &copy; {new Date().getFullYear()} ShrinkRay
        </p>
      </footer>
    </div>
  );
}
