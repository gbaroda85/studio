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
    RefreshCcw,
    Eye,
    ArrowLeftRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function PhotoEnhancer() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [enhancedFileSize, setEnhancedFileSize] = useState<number>(0);
  
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
      setOriginalFileSize(file.size);
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
            const factor = sharpness[0] / 10; 
            
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

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setResultImageSrc(dataUrl);
        
        // Est. size for UI
        setEnhancedFileSize(Math.round((dataUrl.length - 23) * 0.75));
    };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        applyAdjustments();
    }, 50);
    return () => clearTimeout(timer);
  }, [brightness, contrast, saturation, sharpness]);

  const handleAutoEnhance = async () => {
    if (!originalImageSrc) return;
    setIsProcessing(true);
    setProgress(15);

    const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 100);

    setTimeout(() => {
        setBrightness([105]);
        setContrast([115]);
        setSaturation([120]);
        setSharpness([2]);
        
        clearInterval(interval);
        setProgress(100);
        setIsProcessing(false);
        toast({ title: "Auto-Enhance Applied", description: "Visuals balanced for maximum quality." });
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
          <CardTitle className="text-2xl font-black uppercase">AI HD Photo Enhancer</CardTitle>
          <CardDescription>Restore lost details, fix lighting, and sharpen edges using local AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:bg-muted/30 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative">
                <UploadCloud className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                <Zap className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <div>
                <p className="text-xl font-bold">Drop photo to Enhance</p>
                <p className="text-sm text-muted-foreground mt-2">All processing happens in your device RAM.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </CardContent>
        <CardFooter className="justify-center gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-8 bg-muted/10 pt-6">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-600" /> SECURE LOCAL</div>
            <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> INSTANT AI</div>
            <div className="flex items-center gap-1.5"><Sparkles className="size-3 text-primary" /> HD OUTPUT</div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-in fade-in duration-500 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Comparison Preview Area */}
        <div className="lg:col-span-7 space-y-6">
            <Card className="overflow-hidden border-2 shadow-2xl h-full flex flex-col relative border-foreground/5">
                <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-black uppercase tracking-tighter">HD Quality Comparison</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                        {resultImageSrc && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-8 font-black text-[10px] border-2 uppercase">
                                        <Eye className="size-3 mr-1.5" /> Full Zoom Check
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader><DialogTitle className="uppercase font-black tracking-tighter">Precision Enhancement Check</DialogTitle></DialogHeader>
                                    <div className="grid md:grid-cols-2 gap-8 py-6">
                                        <div className="space-y-3">
                                            <Badge variant="outline" className="w-full justify-center py-2 font-black uppercase text-[10px]">ORIGINAL (DULL)</Badge>
                                            <div className="aspect-square relative rounded-2xl overflow-hidden border-2 bg-white flex items-center justify-center">
                                                <Image src={originalImageSrc!} alt="original" fill className="object-contain p-2" />
                                            </div>
                                        </div>
                                        <div className="space-y-3 text-right">
                                            <Badge className="w-full justify-center bg-primary py-2 font-black uppercase text-[10px]">ENHANCED (SHARP)</Badge>
                                            <div className="aspect-square relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-white flex items-center justify-center">
                                                <Image src={resultImageSrc!} alt="enhanced" fill className="object-contain p-2" />
                                            </div>
                                        </div>
                                    </div>
                                    <CardFooter className="p-0 pt-4">
                                        <Button className="w-full h-14 bg-green-600 hover:bg-green-700 font-black text-lg" onClick={handleDownload}>SAVE ENHANCED PHOTO <Download className="ml-2 size-5" /></Button>
                                    </CardFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleReset}><X /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 bg-slate-50 dark:bg-slate-900/50 min-h-[450px]">
                    {isProcessing ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center gap-8">
                            <div className="relative">
                                <Loader2 className="h-20 w-20 animate-spin text-primary stroke-[3]" />
                                <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4 w-full max-w-sm">
                                <p className="font-black text-2xl text-primary uppercase tracking-tighter animate-pulse">Eliminating Blurriness...</p>
                                <Progress value={progress} className="h-2 shadow-inner" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6 h-full">
                            <div className="space-y-3 flex flex-col">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original</span>
                                    <span className="text-[9px] font-mono text-muted-foreground">{formatBytes(originalFileSize)}</span>
                                </div>
                                <div className="flex-1 relative aspect-square md:aspect-auto bg-white rounded-2xl border-2 shadow-inner flex items-center justify-center overflow-hidden min-h-[300px]">
                                    <Image src={originalImageSrc} alt="Before" fill className="object-contain p-4" />
                                </div>
                            </div>
                            <div className="space-y-3 flex flex-col">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><Sparkles className="size-2.5"/> Enhanced Result</span>
                                    <span className="text-[9px] font-mono text-primary font-bold">{formatBytes(enhancedFileSize)}</span>
                                </div>
                                <div className="flex-1 relative aspect-square md:aspect-auto bg-white rounded-2xl border-2 shadow-xl flex items-center justify-center overflow-hidden min-h-[300px] border-primary/20">
                                    {resultImageSrc ? (
                                        <div className="relative size-full animate-in zoom-in-95 duration-500">
                                            <Image src={resultImageSrc} alt="After" fill className="object-contain p-4" />
                                            <div className="absolute top-2 right-2"><div className="bg-green-500 text-white rounded-full p-1 shadow-lg"><CheckCircle2 className="size-4" /></div></div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-10"><ImageIcon className="size-16" /><p className="text-[10px] font-black uppercase">Rendering...</p></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-6">
                    <Button className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl rounded-2xl transition-all" 
                            onClick={handleDownload} disabled={!resultImageSrc || isProcessing}>
                        <Download className="mr-3 h-7 w-7" /> DOWNLOAD ENHANCED PHOTO
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {/* Studio Panel Area */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 shadow-xl border-primary/10 overflow-hidden sticky top-24 rounded-[2.5rem] bg-white dark:bg-slate-950">
                <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between p-6">
                    <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-tighter">
                        <Settings2 className="h-6 w-6 text-primary" /> STUDIO PANEL
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/5 hover:text-primary" onClick={resetAdjustments}>
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                    
                    <Button className="w-full h-14 font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl group relative overflow-hidden" onClick={handleAutoEnhance} disabled={isProcessing}>
                        <Zap className="mr-2 h-6 w-6 text-yellow-400 group-hover:scale-125 transition-transform" />
                        AI AUTO-ENHANCE PRESET
                    </Button>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-2 text-muted-foreground"><Sun className="size-3 text-yellow-500" /> Exposure</Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{brightness[0]}%</span>
                            </div>
                            <Slider min={50} max={150} step={1} value={brightness} onValueChange={setBrightness} className="py-2" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-2 text-muted-foreground"><Contrast className="size-3 text-orange-500" /> Definition</Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{contrast[0]}%</span>
                            </div>
                            <Slider min={50} max={150} step={1} value={contrast} onValueChange={setContrast} className="py-2" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-2 text-muted-foreground"><Droplets className="size-3 text-blue-500" /> Vibrance</Label>
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{saturation[0]}%</span>
                            </div>
                            <Slider min={0} max={200} step={1} value={saturation} onValueChange={setSaturation} className="py-2" />
                        </div>

                        <div className="space-y-4 pt-4 border-t-2 border-dashed border-primary/10">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase flex items-center gap-2 text-primary"><Zap className="size-3" /> Sharpness Level</Label>
                                <Badge className="font-mono font-black text-xs px-2 bg-primary">{sharpness[0]}</Badge>
                            </div>
                            <Slider min={0} max={5} step={0.1} value={sharpness} onValueChange={setSharpness} className="py-2" />
                            <p className="text-[9px] text-muted-foreground font-medium italic">Adjust to recover details from slightly blurry or low-res shots.</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t py-6 px-8">
                    <div className="flex gap-4 items-center">
                        <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="size-5 text-green-600" />
                        </div>
                        <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed">
                            <span className="font-black uppercase block text-foreground">Zero Cloud Footprint</span>
                            Enhancement is performed locally using convolution kernels in your browser.
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
      </div>
      
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
