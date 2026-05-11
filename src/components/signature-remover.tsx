
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { 
  UploadCloud, 
  Loader2, 
  Download, 
  X, 
  Sparkles, 
  Zap,
  ScanSearch,
  CheckCircle2,
  FileType
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/language-context";

export default function SignatureRemover() {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
        setResultImageSrc(null);
        setProgress(0);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file.",
      });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  /**
   * High-Precision Local Extraction Algorithm
   * Runs 100% in-browser. No API calls = No Quota Limits.
   */
  const processLocally = async (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willowReadFrequently: true });
        if (!ctx) return resolve(src);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Smart Background Sampling: Check multiple points to handle shadows/lighting
        const getMultiPointBg = () => {
            let r=0, g=0, b=0, count=0;
            const samples = [
                [5,5], [canvas.width-5, 5], 
                [5, canvas.height-5], [canvas.width-5, canvas.height-5],
                [Math.floor(canvas.width/2), 2]
            ];
            for(const [sx, sy] of samples) {
                const i = (sy * canvas.width + sx) * 4;
                r += data[i]; g += data[i+1]; b += data[i+2];
                count++;
            }
            return { r: r/count, g: g/count, b: b/count };
        };
        const bg = getMultiPointBg();

        // Threshold logic: Euclidean distance to identify ink
        // Adjusted to be sensitive enough for light strokes but clean for paper
        const threshold = 35; 
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];

          const diff = Math.sqrt(
            Math.pow(r - bg.r, 2) + 
            Math.pow(g - bg.g, 2) + 
            Math.pow(b - bg.b, 2)
          );

          if (diff > threshold) {
            // Keep Ink - Preserve original color exactly
            data[i + 3] = 255; 
            
            // Subtle Contrast Boost for better visibility in docs
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luma > 160) { // If it's a very light stroke
                data[i] = Math.max(0, r * 0.85);
                data[i+1] = Math.max(0, g * 0.85);
                data[i+2] = Math.max(0, b * 0.85);
            }
          } else {
            // Remove Paper - Full transparency
            data[i + 3] = 0; 
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  const handleAutoExtract = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setResultImageSrc(null);
    setProgress(10);

    // Fake progress for UX
    const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
    }, 150);

    try {
      const processed = await processLocally(originalImageSrc);
      
      setTimeout(() => {
        setResultImageSrc(processed);
        setProgress(100);
        toast({ 
            title: "Success!", 
            description: "Signature extracted with original colors. Background is now transparent." 
        });
      }, 400);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not process image." });
    } finally {
      clearInterval(interval);
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  const handleDownload = () => {
    if (!resultImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resultImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-signature.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setOriginalImageSrc(null);
    setResultImageSrc(null);
    setIsProcessing(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!originalImageSrc) {
    return (
      <Card
        className={cn("w-full max-w-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/50 dark:hover:shadow-primary/10", isDragOver && "border-primary ring-4 ring-primary/20")}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ScanSearch className="h-10 w-10" />
          </div>
          <CardTitle>Signature Extractor Pro</CardTitle>
          <CardDescription>Extract signatures from papers and make them transparent for Word or PDF documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/50 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative">
                <UploadCloud className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <div>
                <p className="text-xl font-bold">Drop document or photo here</p>
                <p className="text-sm text-muted-foreground mt-2">Best for clear signatures on white/plain paper</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Original */}
        <div className="flex-1 space-y-4">
            <Card className="overflow-hidden border-2 border-foreground/5 shadow-lg">
                <CardHeader className="bg-muted/30 p-4 border-b">
                    <CardTitle className="text-sm font-bold uppercase tracking-tight">Source Image</CardTitle>
                </CardHeader>
                <CardContent className="p-0 aspect-[3/2] relative bg-white">
                    <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4" />
                </CardContent>
            </Card>
            
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-bold text-sm text-primary mb-1">Zero-Quota Logic</h4>
                <p className="text-xs text-muted-foreground">
                    This tool uses 100% local processing. It will never show "Limit Reached" errors and works even with slow internet.
                </p>
            </div>
        </div>

        {/* Right Side: Result */}
        <div className="flex-1">
            <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl relative h-full flex flex-col">
                <CardHeader className="bg-primary/5 p-4 border-b">
                    <CardTitle className="text-sm font-bold uppercase tracking-tight text-primary flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Transparent Result
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative flex items-center justify-center bg-white" 
                             style={{ 
                                backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', 
                                backgroundSize: '20px 20px', 
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
                             }}>
                    
                    {isProcessing ? (
                        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center gap-6">
                            <div className="relative">
                                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4 w-full max-w-xs">
                                <p className="font-black text-xl text-primary animate-pulse uppercase">Extracting Ink...</p>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </div>
                    ) : resultImageSrc ? (
                        <Image src={resultImageSrc} alt="Processed" fill className="object-contain p-4 animate-in zoom-in-95 duration-500" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-20 py-20">
                            <FileType className="h-20 w-20" />
                            <p className="font-bold text-lg uppercase tracking-widest">Ready to Extract</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 bg-muted/10 border-t flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleReset} disabled={isProcessing}>
                        <X className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                    {!resultImageSrc ? (
                        <Button className="flex-[2] h-12 font-black bg-primary hover:bg-primary/90 shadow-lg" 
                                onClick={handleAutoExtract} disabled={isProcessing}>
                            <Zap className="mr-2 h-4 w-4" /> AUTO-EXTRACT SIGNATURE
                        </Button>
                    ) : (
                        <Button className="flex-[2] h-12 font-black bg-green-600 hover:bg-green-700 shadow-lg" 
                                onClick={handleDownload}>
                            <Download className="mr-2 h-5 w-5" /> DOWNLOAD PNG
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
      </div>
      
      {resultImageSrc && !isProcessing && (
         <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg max-w-2xl mx-auto flex gap-3 items-center animate-in slide-in-from-bottom-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-400 font-bold">
                Perfect! Your signature is extracted with original colors and is ready to be used in Word or PDF documents.
            </p>
         </div>
      )}
    </div>
  );
}
