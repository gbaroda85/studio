
"use client";

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
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
  FileType,
  Settings2,
  Eraser,
  RefreshCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function SignatureRemover() {
  const { toast } = useToast();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Controls for better cleaning
  const [sensitivity, setSensitivity] = useState([40]);
  const [boostInk, setBoostInk] = useState([20]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
        setResultImageSrc(null);
        setProgress(0);
        // Reset settings for new image
        setSensitivity([40]);
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
   * Ultra-Clean Local Extraction Algorithm
   * Processes image on canvas to distinguish ink from paper noise.
   */
  const processLocally = async () => {
    if (!originalImageSrc) return;
    
    const img = new window.Image();
    img.src = originalImageSrc;
    
    img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Step 1: Detect brightest point (usually paper) to set a reference
        let maxLuma = 0;
        for (let i = 0; i < data.length; i += 4) {
            const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            if (luma > maxLuma) maxLuma = luma;
        }

        const threshValue = sensitivity[0];
        const inkBoostFactor = 1 + (boostInk[0] / 100);

        // Step 2: Remove background based on distance from reference white and local darkness
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          // How different is this pixel from the estimated 'paper' brightness?
          const diffFromWhite = maxLuma - luma;

          if (diffFromWhite > threshValue) {
            // This is INK
            data[i + 3] = 255; 
            
            // Optional: Make ink darker/vibrant if boosted
            data[i] = Math.max(0, r / inkBoostFactor);
            data[i+1] = Math.max(0, g / inkBoostFactor);
            data[i+2] = Math.max(0, b / inkBoostFactor);
          } else {
            // This is PAPER / NOISE
            data[i + 3] = 0; 
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setResultImageSrc(canvas.toDataURL("image/png"));
    };
  };

  // Re-process when sensitivity changes
  useEffect(() => {
    if (originalImageSrc) {
        const timer = setTimeout(() => {
            processLocally();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [sensitivity, boostInk, originalImageSrc]);

  const handleStartExtraction = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setProgress(20);
    
    // UI feedback delay
    setTimeout(() => {
        setProgress(100);
        processLocally();
        setIsProcessing(false);
        toast({ title: "Extraction Active", description: "Use sliders to fine-tune the result." });
    }, 600);
  };

  const handleDownload = () => {
    if (!resultImageSrc || !imageFile) return;
    const link = document.createElement("a");
    link.href = resultImageSrc;
    const nameParts = imageFile.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    link.download = `${name}-clean-signature.png`;
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
    setSensitivity([40]);
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
          <CardTitle className="text-2xl font-black">Signature Extractor Pro</CardTitle>
          <CardDescription>Extract clean signatures from paper photos. Ideal for digital docs.</CardDescription>
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
                <p className="text-xl font-bold">Drop photo or Click to select</p>
                <p className="text-sm text-muted-foreground mt-2">Works best with black/blue ink on plain paper</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Comparison Area */}
        <div className="lg:col-span-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="overflow-hidden border-2 shadow-lg">
                    <CardHeader className="bg-muted/30 p-3 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Photo</CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReset}><RefreshCcw className="h-3 w-3" /></Button>
                    </CardHeader>
                    <CardContent className="p-0 aspect-square relative bg-white">
                        <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4" />
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl relative">
                    <CardHeader className="bg-primary/5 p-3 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" /> Result (Transparent)
                        </CardTitle>
                        {resultImageSrc && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </CardHeader>
                    <CardContent className="p-0 aspect-square relative flex items-center justify-center bg-white" 
                                 style={{ 
                                    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', 
                                    backgroundSize: '20px 20px' 
                                 }}>
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <Progress value={progress} className="w-32 h-1" />
                            </div>
                        ) : resultImageSrc ? (
                            <Image src={resultImageSrc} alt="Processed" fill className="object-contain p-4 animate-in zoom-in-95 duration-300" />
                        ) : (
                            <div className="text-center p-8 opacity-20">
                                <Eraser className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-xs font-bold uppercase">Ready to Clean</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                {!resultImageSrc ? (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl" onClick={handleStartExtraction}>
                        <Zap className="mr-2 h-5 w-5" /> START CLEANING
                    </Button>
                ) : (
                    <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl" onClick={handleDownload}>
                        <Download className="mr-2 h-6 w-6" /> DOWNLOAD PNG
                    </Button>
                )}
            </div>
        </div>

        {/* Studio Controls */}
        <div className={cn("lg:col-span-4 space-y-6 transition-all", !originalImageSrc && "opacity-20 pointer-events-none")}>
            <Card className="border-2 shadow-xl border-primary/10">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2 font-bold">
                        <Settings2 className="h-5 w-5 text-primary" /> Fine-Tune Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                                <Eraser className="size-3" /> Background Sensitivity
                            </Label>
                            <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary">{sensitivity[0]}</span>
                        </div>
                        <Slider min={5} max={150} step={1} value={sensitivity} onValueChange={setSensitivity} />
                        <p className="text-[9px] text-muted-foreground italic">Increase this if you see dots or "grit" in the background.</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                                <FileType className="size-3" /> Ink Darkness
                            </Label>
                            <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary">+{boostInk[0]}%</span>
                        </div>
                        <Slider min={0} max={100} step={1} value={boostInk} onValueChange={setBoostInk} />
                        <p className="text-[9px] text-muted-foreground italic">Makes the signature strokes darker and clearer.</p>
                    </div>

                    <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 flex gap-3">
                        <FileType className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-green-700 uppercase tracking-tight">Pro Tip</p>
                            <p className="text-[9px] text-green-600/80 font-medium leading-relaxed">
                                Use the sensitivity slider to wipe out shadows. The background is now 100% transparent for documents.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      
      {/* Offscreen rendering canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

