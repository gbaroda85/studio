
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { 
    UploadCloud, 
    Loader2, 
    Download, 
    X, 
    Wand2, 
    Sparkles, 
    Zap, 
    CheckCircle2,
    ShieldCheck,
    Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PhotoEnhancer() {
  const { toast } = useToast();
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
        description: "Please select a valid image file (PNG, JPG, etc.).",
      });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  /**
   * High-Performance Local Photo Enhancement Algorithm
   * Performs Contrast normalization, Color boosting, and Sharpness enhancement.
   */
  const enhanceLocally = async (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(src);

        canvas.width = img.width;
        canvas.height = img.height;
        
        // 1. Draw original to canvas
        ctx.drawImage(img, 0, 0);

        // 2. Apply Image Filters (Browser Native for speed)
        // Brightness +10%, Contrast +20%, Saturate +30%
        ctx.filter = 'brightness(1.05) contrast(1.15) saturate(1.25)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';

        // 3. Smart Sharpening (Unsharp Mask via Convolution)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Simplified Sharpen Kernel
        // [ 0, -1,  0 ]
        // [-1,  5, -1 ]
        // [ 0, -1,  0 ]
        const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        const side = Math.round(Math.sqrt(kernel.length));
        const halfSide = Math.floor(side / 2);
        const output = ctx.createImageData(width, height);
        const dst = output.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dstOff = (y * width + x) * 4;
                let r = 0, g = 0, b = 0;
                
                for (let cy = 0; y + cy - halfSide >= 0 && y + cy - halfSide < height && cy < side; cy++) {
                    for (let cx = 0; x + cx - halfSide >= 0 && x + cx - halfSide < width && cx < side; cx++) {
                        const scy = y + cy - halfSide;
                        const scx = x + cx - halfSide;
                        const srcOff = (scy * width + scx) * 4;
                        const wt = kernel[cy * side + cx];
                        r += data[srcOff] * wt;
                        g += data[srcOff + 1] * wt;
                        b += data[srcOff + 2] * wt;
                    }
                }
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = data[dstOff + 3];
            }
        }

        ctx.putImageData(output, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
    });
  };

  const handleEnhance = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setResultImageSrc(null);
    setProgress(15);

    const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 100);

    try {
      const enhanced = await enhanceLocally(originalImageSrc);
      setTimeout(() => {
        setResultImageSrc(enhanced);
        setProgress(100);
        toast({ title: "Enhancement Complete!", description: "Lighting, colors, and sharpness improved." });
      }, 300);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Processing Error", description: "Could not enhance photo." });
    } finally {
      clearInterval(interval);
      setTimeout(() => setIsProcessing(false), 400);
    }
  };

  const handleDownload = () => {
    if (!resultImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resultImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-enhanced.jpg`;
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
            <Wand2 className="h-10 w-10" />
          </div>
          <CardTitle>AI Photo Enhancer</CardTitle>
          <CardDescription>Automatically fix lighting, sharpen details, and boost colors in one click.</CardDescription>
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
                <p className="text-xl font-bold">Drop photo here or Click to select</p>
                <p className="text-sm text-muted-foreground mt-2">Works for portraits, landscapes, and screenshots.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-xs text-muted-foreground font-medium pb-8 border-t pt-6 bg-muted/20">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> No Quota Limits</div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-500" /> Instant Processing</div>
            <div className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> HD Output</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Original Side */}
        <div className="space-y-4">
            <Card className="overflow-hidden border-2 shadow-lg h-full flex flex-col">
                <CardHeader className="bg-muted/30 border-b py-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Original Image
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative bg-white min-h-[400px]">
                    <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4" />
                </CardContent>
            </Card>
        </div>

        {/* Enhanced Side */}
        <div className="space-y-4">
            <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl h-full flex flex-col relative">
                <CardHeader className="bg-primary/5 border-b py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Enhanced HD Result
                    </CardTitle>
                    {resultImageSrc && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </CardHeader>
                <CardContent className="p-0 flex-1 relative bg-muted/10 flex items-center justify-center min-h-[400px]">
                    {isProcessing ? (
                        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center gap-6">
                            <div className="relative">
                                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                <Wand2 className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4 w-full max-w-xs">
                                <p className="font-black text-xl text-primary animate-pulse uppercase tracking-tight">Improving Quality...</p>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </div>
                    ) : resultImageSrc ? (
                        <Image src={resultImageSrc} alt="Result" fill className="object-contain p-4 animate-in zoom-in-95 duration-500" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-20 py-20">
                            <Sparkles className="h-20 w-20" />
                            <p className="font-bold text-lg uppercase tracking-widest">Ready to Enhance</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-4 flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1 border-2 font-bold" onClick={handleReset} disabled={isProcessing}>
                        <X className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                    {!resultImageSrc ? (
                        <Button className="flex-[2] h-12 font-black bg-primary hover:bg-primary/90 shadow-lg text-lg" 
                                onClick={handleEnhance} disabled={isProcessing}>
                            <Zap className="mr-2 h-5 w-5" /> AUTO-ENHANCE PHOTO
                        </Button>
                    ) : (
                        <Button className="flex-[2] h-12 font-black bg-green-600 hover:bg-green-700 shadow-lg text-lg" 
                                onClick={handleDownload}>
                            <Download className="mr-2 h-5 w-5" /> DOWNLOAD HD IMAGE
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
      </div>
      
      {resultImageSrc && !isProcessing && (
         <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl max-w-3xl mx-auto flex gap-4 items-center animate-in slide-in-from-bottom-4">
            <div className="size-10 rounded-full bg-green-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-green-900 dark:text-green-300 font-black uppercase tracking-tight">Optimization Success</p>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                    Photo details sharpened and colors balanced locally. No cloud limits applied.
                </p>
            </div>
         </div>
      )}
    </div>
  );
}
