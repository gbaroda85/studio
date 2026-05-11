"use client";

import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
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
    Image as ImageIcon,
    Settings2,
    Sun,
    Contrast,
    Droplets,
    ZapOff,
    RefreshCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function PhotoEnhancer() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Manual Adjustment States
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [sharpness, setSharpness] = useState([0]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setOriginalImageSrc(src);
        setResultImageSrc(src);
        resetAdjustments();
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

  const resetAdjustments = () => {
    setBrightness([100]);
    setContrast([100]);
    setSaturation([100]);
    setSharpness([0]);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files?.[0] || null); };

  /**
   * Apply Adjustments to Canvas
   */
  const applyAdjustments = async () => {
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
        
        // 1. Clear and Draw Original
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 2. Apply Filters (Brightness, Contrast, Saturation)
        ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`;
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';

        // 3. Apply Sharpness (Convolution)
        if (sharpness[0] > 0) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const w = canvas.width;
            const h = canvas.height;
            const factor = sharpness[0] / 10; // Normalized factor
            
            const kernel = [
                0, -factor, 0,
                -factor, 1 + (4 * factor), -factor,
                0, -factor, 0
            ];
            
            const output = ctx.createImageData(w, h);
            const dst = output.data;

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const i = (y * w + x) * 4;
                    let r = 0, g = 0, b = 0;
                    
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const scy = Math.min(h - 1, Math.max(0, y + ky));
                            const scx = Math.min(w - 1, Math.max(0, x + kx));
                            const srcOff = (scy * w + scx) * 4;
                            const wt = kernel[(ky + 1) * 3 + (kx + 1)];
                            r += data[srcOff] * wt;
                            g += data[srcOff + 1] * wt;
                            b += data[srcOff + 2] * wt;
                        }
                    }
                    dst[i] = r;
                    dst[i + 1] = g;
                    dst[i + 2] = b;
                    dst[i + 3] = data[i + 3];
                }
            }
            ctx.putImageData(output, 0, 0);
        }

        setResultImageSrc(canvas.toDataURL("image/jpeg", 0.95));
    };
  };

  // Auto-apply adjustments when sliders change
  useEffect(() => {
    const timer = setTimeout(() => {
        applyAdjustments();
    }, 50); // Small debounce for performance
    return () => clearTimeout(timer);
  }, [brightness, contrast, saturation, sharpness]);

  const handleAutoEnhance = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setProgress(15);

    const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 100);

    // AI-like Auto Preset Values
    setTimeout(() => {
        setBrightness([105]);
        setContrast([115]);
        setSaturation([120]);
        setSharpness([2]);
        
        clearInterval(interval);
        setProgress(100);
        setIsProcessing(false);
        toast({ title: "Auto-Enhance Applied", description: "Brightness, Colors, and Sharpness optimized." });
    }, 500);
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
    resetAdjustments();
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
          <CardDescription>Automatically fix lighting, sharpen details, and boost colors or adjust manually.</CardDescription>
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
                <p className="text-sm text-muted-foreground mt-2">Works locally. Fast & Private.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-xs text-muted-foreground font-medium pb-8 border-t pt-6 bg-muted/20">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> Unlimited Uses</div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-500" /> Instant Local Engine</div>
            <div className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> HD Output</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Preview Area */}
        <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden border-2 shadow-2xl h-full flex flex-col relative">
                <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> HD Result Preview
                    </CardTitle>
                    {resultImageSrc && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </CardHeader>
                <CardContent className="p-0 flex-1 relative bg-white min-h-[450px] flex items-center justify-center">
                    {isProcessing && (
                        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center gap-6">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            <div className="space-y-4 w-full max-w-xs">
                                <p className="font-black text-xl text-primary animate-pulse uppercase">Applying Optimization...</p>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </div>
                    )}
                    {resultImageSrc ? (
                        <Image src={resultImageSrc} alt="Enhanced" fill className="object-contain p-4" />
                    ) : (
                        <Image src={originalImageSrc} alt="Original" fill className="object-contain p-4 opacity-50" />
                    )}
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-4 flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1 border-2 font-bold" onClick={handleReset}>
                        <X className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                    <Button className="flex-[2] h-12 font-black bg-green-600 hover:bg-green-700 shadow-lg text-lg" 
                            onClick={handleDownload}>
                        <Download className="mr-2 h-5 w-5" /> DOWNLOAD HD PHOTO
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {/* Manual Controls Area */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-xl border-primary/10">
                <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" /> Adjustments
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={resetAdjustments} title="Reset sliders">
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                    
                    <Button className="w-full h-12 font-black bg-primary hover:bg-primary/90 shadow-md group" onClick={handleAutoEnhance} disabled={isProcessing}>
                        <Zap className="mr-2 h-5 w-5 text-yellow-400 group-hover:scale-125 transition-transform" />
                        AUTO-ENHANCE PRESET
                    </Button>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5"><Sun className="size-3 text-yellow-500" /> Brightness</Label>
                                <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{brightness[0]}%</span>
                            </div>
                            <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5"><Contrast className="size-3 text-orange-500" /> Contrast</Label>
                                <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{contrast[0]}%</span>
                            </div>
                            <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5"><Droplets className="size-3 text-blue-500" /> Saturation</Label>
                                <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">{saturation[0]}%</span>
                            </div>
                            <Slider min={0} max={200} step={1} value={saturation} onValueChange={setSaturation} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-1.5"><Zap className="size-3 text-primary" /> Sharpness</Label>
                                <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded">Level {sharpness[0]}</span>
                            </div>
                            <Slider min={0} max={5} step={0.1} value={sharpness} onValueChange={setSharpness} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t py-4">
                    <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                        <ShieldCheck className="size-3 text-green-500" />
                        <span>All edits are performed locally in 100% HD.</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
